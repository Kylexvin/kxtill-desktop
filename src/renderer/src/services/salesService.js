// src/services/salesService.js
const salesService = {
  async processSale(saleData) {
    try {
      // Add offline metadata
      const saleWithOfflineData = {
        ...saleData,
        localId: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isLocal: true,
        synced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (navigator.onLine) {
        // Online: Try API first
        try {
          const response = await window.axios.post('/sales/create', saleData);
          const apiSale = response.data;
          
          // Also save to local SQLite for offline access
          if (window.electronAPI?.database?.saveSale) {
            await window.electronAPI.database.saveSale({
              ...apiSale,
              synced: true,
              localId: saleWithOfflineData.localId
            });
          }
          
          return apiSale;
        } catch (apiError) {
          console.error('API sale processing failed, saving locally:', apiError);
          // Fallback to local storage
          if (window.electronAPI?.database?.saveSale) {
            const localSale = await window.electronAPI.database.saveSale(saleWithOfflineData);
            return localSale;
          }
          throw apiError;
        }
      } else {
        // Offline: Save to local SQLite only
        if (window.electronAPI?.database?.saveSale) {
          const localSale = await window.electronAPI.database.saveSale(saleWithOfflineData);
          
          // Also update local inventory if needed
          if (window.electronAPI?.database?.updateInventoryFromSale) {
            await window.electronAPI.database.updateInventoryFromSale(saleWithOfflineData);
          }
          
          return localSale;
        }
        throw new Error('Offline sale processing not available');
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      throw error;
    }
  },

  async getSales() {
    try {
      if (navigator.onLine) {
        // Online: Fetch from API and sync to local
        const response = await window.axios.get('/sales');
        const sales = response.data.sales;
        
        // Sync to local SQLite
        if (window.electronAPI?.database?.syncSales) {
          await window.electronAPI.database.syncSales(sales);
        }
        
        return sales;
      } else {
        // Offline: Get from local SQLite
        if (window.electronAPI?.database?.getSales) {
          const localSales = await window.electronAPI.database.getSales();
          return localSales;
        }
        throw new Error('No local sales data available offline');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      
      // Fallback to local data
      if (window.electronAPI?.database?.getSales) {
        try {
          const localSales = await window.electronAPI.database.getSales();
          console.log('Using local sales data as fallback');
          return localSales;
        } catch (localError) {
          console.error('Local sales also failed:', localError);
        }
      }
      
      throw error;
    }
  },

  async getSaleById(saleId) {
    try {
      // First try local SQLite (works for both online and offline)
      if (window.electronAPI?.database?.getSaleById) {
        const localSale = await window.electronAPI.database.getSaleById(saleId);
        if (localSale) {
          return localSale;
        }
      }
      
      // If not found locally and online, try API
      if (navigator.onLine) {
        const response = await window.axios.get(`/sales/${saleId}`);
        
        // Cache the sale locally
        if (window.electronAPI?.database?.saveSale) {
          await window.electronAPI.database.saveSale({
            ...response.data,
            synced: true
          });
        }
        
        return response.data;
      }
      
      throw new Error('Sale not found locally and offline');
    } catch (error) {
      console.error('Error fetching sale by ID:', error);
      throw error;
    }
  },

  async getTodaySales() {
    try {
      if (navigator.onLine) {
        // Online: Get from API and cache
        const response = await window.axios.get('/sales/today');
        
        // Cache today's sales locally
        if (window.electronAPI?.database?.cacheTodaySales) {
          await window.electronAPI.database.cacheTodaySales(response.data);
        }
        
        return response.data;
      } else {
        // Offline: Calculate from local SQLite
        if (window.electronAPI?.database?.getTodaySales) {
          const localTodaySales = await window.electronAPI.database.getTodaySales();
          return localTodaySales;
        }
        
        // Fallback: calculate manually from local sales
        if (window.electronAPI?.database?.getSales) {
          const allSales = await window.electronAPI.database.getSales();
          const today = new Date().toISOString().split('T')[0];
          const todaySales = allSales.filter(sale => 
            sale.createdAt?.startsWith(today) || sale.date?.startsWith(today)
          );
          
          const total = todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
          const count = todaySales.length;
          
          return {
            sales: todaySales,
            total,
            count,
            average: count > 0 ? total / count : 0
          };
        }
        
        throw new Error('No today sales data available offline');
      }
    } catch (error) {
      console.error('Error fetching today sales:', error);
      
      // Multiple fallback strategies
      if (window.electronAPI?.database?.getTodaySales) {
        try {
          const localTodaySales = await window.electronAPI.database.getTodaySales();
          return localTodaySales;
        } catch (localError) {
          console.error('Local today sales also failed:', localError);
        }
      }
      
      throw error;
    }
  },

  // NEW: Sync offline sales when coming online
  async syncOfflineSales() {
    try {
      if (window.electronAPI?.sync?.syncOfflineSales) {
        return await window.electronAPI.sync.syncOfflineSales();
      }
      return { synced: 0, errors: [] };
    } catch (error) {
      console.error('Error syncing offline sales:', error);
      throw error;
    }
  },

  // NEW: Get sales that need sync
  async getPendingSyncSales() {
    try {
      if (window.electronAPI?.database?.getPendingSyncSales) {
        return await window.electronAPI.database.getPendingSyncSales();
      }
      return [];
    } catch (error) {
      console.error('Error getting pending sync sales:', error);
      return [];
    }
  },

  // NEW: Get sales summary for dashboard (offline compatible)
  async getSalesSummary(period = 'today') {
    try {
      if (navigator.onLine) {
        const response = await window.axios.get(`/sales/summary?period=${period}`);
        
        // Cache summary locally
        if (window.electronAPI?.database?.cacheSalesSummary) {
          await window.electronAPI.database.cacheSalesSummary(period, response.data);
        }
        
        return response.data;
      } else {
        // Offline: Calculate from local data
        if (window.electronAPI?.database?.getSalesSummary) {
          return await window.electronAPI.database.getSalesSummary(period);
        }
        throw new Error('Sales summary not available offline');
      }
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      
      // Fallback to local calculation
      if (window.electronAPI?.database?.getSalesSummary) {
        try {
          return await window.electronAPI.database.getSalesSummary(period);
        } catch (localError) {
          console.error('Local sales summary also failed:', localError);
        }
      }
      
      throw error;
    }
  }
};

export default salesService;
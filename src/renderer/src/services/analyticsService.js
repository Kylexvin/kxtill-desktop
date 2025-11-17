// src/services/analyticsService.js
const analyticsService = {
  async getDashboardData(period = 'today') {
    try {
      if (navigator.onLine) {
        // Online: Fetch from API and cache in SQLite
        const response = await window.axios.get(`/analytics/complete?period=${period}`);
        
        // Cache the data for offline use
        if (window.electronAPI?.database?.cacheAnalytics) {
          await window.electronAPI.database.cacheAnalytics({
            type: 'dashboard',
            period,
            data: response.data,
            timestamp: new Date().toISOString()
          });
        }
        
        return response.data;
      } else {
        // Offline: Get cached data from SQLite
        if (window.electronAPI?.database?.getCachedAnalytics) {
          const cachedData = await window.electronAPI.database.getCachedAnalytics('dashboard', period);
          if (cachedData) {
            return cachedData;
          }
        }
        throw new Error('No cached data available offline');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback: Try to get cached data even if online request fails
      if (window.electronAPI?.database?.getCachedAnalytics) {
        try {
          const cachedData = await window.electronAPI.database.getCachedAnalytics('dashboard', period);
          if (cachedData) {
            console.log('Using cached data as fallback');
            return cachedData;
          }
        } catch (cacheError) {
          console.error('Fallback cache also failed:', cacheError);
        }
      }
      
      throw error;
    }
  },

  async getComprehensiveAnalytics(period = '7d') {
    try {
      if (navigator.onLine) {
        const response = await window.axios.get(`/analytics/comprehensive?period=${period}`);
        
        // Cache for offline
        if (window.electronAPI?.database?.cacheAnalytics) {
          await window.electronAPI.database.cacheAnalytics({
            type: 'comprehensive',
            period,
            data: response.data,
            timestamp: new Date().toISOString()
          });
        }
        
        return response.data;
      } else {
        if (window.electronAPI?.database?.getCachedAnalytics) {
          const cachedData = await window.electronAPI.database.getCachedAnalytics('comprehensive', period);
          if (cachedData) {
            return cachedData;
          }
        }
        throw new Error('No cached data available offline');
      }
    } catch (error) {
      console.error('Error fetching comprehensive analytics:', error);
      
      // Fallback to cached data
      if (window.electronAPI?.database?.getCachedAnalytics) {
        try {
          const cachedData = await window.electronAPI.database.getCachedAnalytics('comprehensive', period);
          if (cachedData) {
            console.log('Using cached comprehensive data as fallback');
            return cachedData;
          }
        } catch (cacheError) {
          console.error('Fallback cache also failed:', cacheError);
        }
      }
      
      throw error;
    }
  },

  async getLowStockData(threshold = 10) {
    try {
      if (navigator.onLine) {
        const response = await window.axios.get(`/analytics/low-stock?threshold=${threshold}`);
        
        // Cache for offline
        if (window.electronAPI?.database?.cacheAnalytics) {
          await window.electronAPI.database.cacheAnalytics({
            type: 'low-stock',
            threshold,
            data: response.data,
            timestamp: new Date().toISOString()
          });
        }
        
        return response.data;
      } else {
        // For low stock, we can calculate from local SQLite data
        if (window.electronAPI?.database?.getLowStockFromLocal) {
          const localLowStock = await window.electronAPI.database.getLowStockFromLocal(threshold);
          return localLowStock;
        }
        
        // Fallback to cached data
        if (window.electronAPI?.database?.getCachedAnalytics) {
          const cachedData = await window.electronAPI.database.getCachedAnalytics('low-stock', threshold.toString());
          if (cachedData) {
            return cachedData;
          }
        }
        
        throw new Error('No low stock data available offline');
      }
    } catch (error) {
      console.error('Error fetching low stock data:', error);
      
      // Multiple fallback strategies
      if (window.electronAPI?.database?.getLowStockFromLocal) {
        try {
          const localLowStock = await window.electronAPI.database.getLowStockFromLocal(threshold);
          return localLowStock;
        } catch (localError) {
          console.error('Local low stock calculation failed:', localError);
        }
      }
      
      if (window.electronAPI?.database?.getCachedAnalytics) {
        try {
          const cachedData = await window.electronAPI.database.getCachedAnalytics('low-stock', threshold.toString());
          if (cachedData) {
            console.log('Using cached low stock data as fallback');
            return cachedData;
          }
        } catch (cacheError) {
          console.error('Fallback cache also failed:', cacheError);
        }
      }
      
      throw error;
    }
  }
};

export default analyticsService;
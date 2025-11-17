// src/services/inventoryService.js
const inventoryService = {
  async getInventory() {
    try {
      if (navigator.onLine) {
        // Online: Fetch from API and sync to SQLite
        const response = await window.axios.get('/products');
        const products = response.data.products;
        
        // Sync products to local SQLite for offline use
        if (window.electronAPI?.database?.syncProducts) {
          await window.electronAPI.database.syncProducts(products);
        }
        
        return products;
      } else {
        // Offline: Get from local SQLite
        if (window.electronAPI?.database?.getProducts) {
          const localProducts = await window.electronAPI.database.getProducts();
          return localProducts;
        }
        throw new Error('No local inventory data available offline');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      
      // Fallback: Try local SQLite even if online request fails
      if (window.electronAPI?.database?.getProducts) {
        try {
          const localProducts = await window.electronAPI.database.getProducts();
          console.log('Using local inventory data as fallback');
          return localProducts;
        } catch (localError) {
          console.error('Local inventory also failed:', localError);
        }
      }
      
      throw error;
    }
  },

  async updateProduct(productId, productData) {
    try {
      // First update locally for immediate response
      if (window.electronAPI?.database?.updateProduct) {
        const localUpdate = await window.electronAPI.database.updateProduct(productId, productData);
        
        // If online, also update the API
        if (navigator.onLine) {
          try {
            const response = await window.axios.put(`/products/${productId}`, productData);
            
            // Mark local update as synced
            if (window.electronAPI?.database?.markProductSynced) {
              await window.electronAPI.database.markProductSynced(productId);
            }
            
            return response.data;
          } catch (apiError) {
            console.error('API update failed, keeping local changes:', apiError);
            // Local update already done, so return success
            return localUpdate;
          }
        } else {
          // Offline: just mark for sync later
          if (window.electronAPI?.database?.markProductForSync) {
            await window.electronAPI.database.markProductForSync(productId, 'update', productData);
          }
          return localUpdate;
        }
      } else {
        // Fallback: direct API call if no SQLite available
        const response = await window.axios.put(`/products/${productId}`, productData);
        return response.data;
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(productId) {
    try {
      // First mark as deleted locally
      if (window.electronAPI?.database?.deleteProduct) {
        const localDelete = await window.electronAPI.database.deleteProduct(productId);
        
        // If online, also delete from API
        if (navigator.onLine) {
          try {
            const response = await window.axios.delete(`/products/${productId}`);
            
            // Remove from local DB after successful API deletion
            if (window.electronAPI?.database?.permanentlyDeleteProduct) {
              await window.electronAPI.database.permanentlyDeleteProduct(productId);
            }
            
            return response.data;
          } catch (apiError) {
            console.error('API delete failed, keeping local deletion:', apiError);
            // Local deletion already done, so return success
            return localDelete;
          }
        } else {
          // Offline: mark for sync deletion later
          if (window.electronAPI?.database?.markProductForSync) {
            await window.electronAPI.database.markProductForSync(productId, 'delete');
          }
          return localDelete;
        }
      } else {
        // Fallback: direct API call
        const response = await window.axios.delete(`/products/${productId}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // NEW: Sync local changes when coming online
  async syncLocalChanges() {
    try {
      if (window.electronAPI?.sync?.syncInventoryChanges) {
        return await window.electronAPI.sync.syncInventoryChanges();
      }
      return { synced: 0, errors: [] };
    } catch (error) {
      console.error('Error syncing inventory changes:', error);
      throw error;
    }
  },

  // NEW: Get products that need sync
  async getPendingSyncProducts() {
    try {
      if (window.electronAPI?.database?.getPendingSyncProducts) {
        return await window.electronAPI.database.getPendingSyncProducts();
      }
      return [];
    } catch (error) {
      console.error('Error getting pending sync products:', error);
      return [];
    }
  }
};

export default inventoryService;
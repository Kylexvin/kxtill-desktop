// src/services/productService.js
const productService = {
  async getAllProducts() {
    try {
      if (navigator.onLine) {
        // Online: Fetch from API and cache in SQLite
        const response = await window.axios.get('/products');
        const products = response.data.products;
        
        // Cache products in SQLite for offline use
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
        throw new Error('No local product data available offline');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Fallback: Try local SQLite even if online request fails
      if (window.electronAPI?.database?.getProducts) {
        try {
          const localProducts = await window.electronAPI.database.getProducts();
          console.log('Using local product data as fallback');
          return localProducts;
        } catch (localError) {
          console.error('Local products also failed:', localError);
        }
      }
      
      throw error;
    }
  },

  async createProduct(productData) {
    try {
      // Generate temporary ID for offline use
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const productWithTempId = {
        ...productData,
        id: tempId,
        isLocal: true,
        createdAt: new Date().toISOString()
      };
      
      // First create locally for immediate response
      if (window.electronAPI?.database?.createProduct) {
        const localProduct = await window.electronAPI.database.createProduct(productWithTempId);
        
        // If online, also create via API
        if (navigator.onLine) {
          try {
            const response = await window.axios.post('/products/create', productData);
            const apiProduct = response.data;
            
            // Update local record with real ID from API
            if (window.electronAPI?.database?.updateProductId) {
              await window.electronAPI.database.updateProductId(tempId, apiProduct.id);
            }
            
            return apiProduct;
          } catch (apiError) {
            console.error('API create failed, keeping local product:', apiError);
            // Mark for sync later
            if (window.electronAPI?.database?.markProductForSync) {
              await window.electronAPI.database.markProductForSync(tempId, 'create', productData);
            }
            return localProduct;
          }
        } else {
          // Offline: mark for sync creation later
          if (window.electronAPI?.database?.markProductForSync) {
            await window.electronAPI.database.markProductForSync(tempId, 'create', productData);
          }
          return localProduct;
        }
      } else {
        // Fallback: direct API call if no SQLite available
        const response = await window.axios.post('/products/create', productData);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating product:', error);
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
            // Mark for sync later
            if (window.electronAPI?.database?.markProductForSync) {
              await window.electronAPI.database.markProductForSync(productId, 'update', productData);
            }
            return localUpdate;
          }
        } else {
          // Offline: mark for sync update later
          if (window.electronAPI?.database?.markProductForSync) {
            await window.electronAPI.database.markProductForSync(productId, 'update', productData);
          }
          return localUpdate;
        }
      } else {
        // Fallback: direct API call
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
      // First mark as deleted locally (soft delete)
      if (window.electronAPI?.database?.deleteProduct) {
        const localDelete = await window.electronAPI.database.deleteProduct(productId);
        
        // If online, also delete from API
        if (navigator.onLine) {
          try {
            const response = await window.axios.delete(`/products/${productId}`);
            
            // Permanently remove from local DB after successful API deletion
            if (window.electronAPI?.database?.permanentlyDeleteProduct) {
              await window.electronAPI.database.permanentlyDeleteProduct(productId);
            }
            
            return response.data;
          } catch (apiError) {
            console.error('API delete failed, keeping local deletion:', apiError);
            // Mark for sync deletion later
            if (window.electronAPI?.database?.markProductForSync) {
              await window.electronAPI.database.markProductForSync(productId, 'delete');
            }
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

  // NEW: Search products locally (for offline POS)
  async searchProducts(query) {
    try {
      if (window.electronAPI?.database?.searchProducts) {
        return await window.electronAPI.database.searchProducts(query);
      }
      
      // Fallback: use getAllProducts and filter client-side
      const allProducts = await this.getAllProducts();
      return allProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.barcode?.includes(query) ||
        product.sku?.includes(query)
      );
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  // NEW: Get product by ID with offline support
  async getProductById(productId) {
    try {
      if (window.electronAPI?.database?.getProductById) {
        const localProduct = await window.electronAPI.database.getProductById(productId);
        if (localProduct) {
          return localProduct;
        }
      }
      
      // Fallback to API if not found locally
      if (navigator.onLine) {
        const response = await window.axios.get(`/products/${productId}`);
        return response.data;
      }
      
      throw new Error('Product not found locally and offline');
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  }
};

export default productService;
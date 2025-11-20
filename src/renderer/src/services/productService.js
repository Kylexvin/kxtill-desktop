// src/services/productService.js

// Add this safety check at the top
console.log('🔧 productService loading...');
console.log('🔧 window.electronAPI available:', !!window.electronAPI);
console.log('🔧 window.electronAPI.database available:', !!window.electronAPI?.database);

// Safe electronAPI access
const getSafeElectronAPI = () => {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI;
  }
  console.warn('⚠️ electronAPI not available - running in browser mode');
  return {
    database: {
      syncProducts: () => {
        console.log('⚠️ Mock: syncProducts called');
        return Promise.resolve({ success: true, count: 0 });
      },
      getProducts: () => {
        console.log('⚠️ Mock: getProducts called');
        return Promise.resolve([]);
      },
      debugGetAllData: () => {
        console.log('⚠️ Mock: debugGetAllData called');
        return Promise.resolve({ productCount: 0, products: [] });
      },
      debugTestSync: () => {
        console.log('⚠️ Mock: debugTestSync called');
        return Promise.resolve({ success: true, saved: 0, verified: 0, products: [] });
      },
      debugCheckConnection: () => {
        console.log('⚠️ Mock: debugCheckConnection called');
        return Promise.resolve({ success: false, error: 'No Electron API' });
      },
      debugClearDatabase: () => {
        console.log('⚠️ Mock: debugClearDatabase called');
        return Promise.resolve({ success: false, error: 'No Electron API' });
      },
      createProduct: () => Promise.resolve({ id: 'mock-id' }),
      updateProduct: () => Promise.resolve({ success: true }),
      deleteProduct: () => Promise.resolve({ success: true }),
      getProductById: () => Promise.resolve(null),
      searchProducts: () => Promise.resolve([]),
      markProductForSync: () => Promise.resolve({ success: true }),
      markProductSynced: () => Promise.resolve({ success: true }),
      updateProductId: () => Promise.resolve({ success: true }),
      permanentlyDeleteProduct: () => Promise.resolve({ success: true })
    }
  };
};

const electronAPI = getSafeElectronAPI();

const productService = {
  async getAllProducts() {
    try {
      console.log('🔄 ===== getAllProducts START =====');
      console.log('📡 Online status:', navigator.onLine);
      console.log('💻 Electron API available:', !!electronAPI.database);
      
      if (navigator.onLine) {
        console.log('🌐 ONLINE: Fetching from API...');
        
        try {
          console.log('📡 Making API call to /products...');
          const response = await window.axios.get('/products');
          console.log('✅ API Response status:', response.status);
          console.log('📊 Response data structure:', Object.keys(response.data));
          console.log('📦 Products array exists:', !!response.data.products);
          
          const products = response.data.products;
          console.log('🔢 Products count from API:', products?.length);
          
          if (products && products.length > 0) {
            console.log('📝 Sample API product structure:', {
              id: products[0].id,
              name: products[0].name,
              sellingPrice: products[0].sellingPrice,
              trackStock: products[0].trackStock,
              quantity: products[0].quantity,
              keys: Object.keys(products[0])
            });
          } else {
            console.log('❌ API returned empty products array');
          }
          
          if (!products || !Array.isArray(products)) {
            console.log('❌ API returned invalid products format');
            throw new Error('Invalid products format from API');
          }

          // Cache products in SQLite for offline use
          if (electronAPI.database?.syncProducts) {
            console.log('💾 Syncing to SQLite...');
            console.log('📤 First 2 products being synced:', products.slice(0, 2));
            
            const syncResult = await electronAPI.database.syncProducts(products);
            console.log('✅ Sync result:', syncResult);
            
            // Verify sync worked
            if (electronAPI.database?.getProducts) {
              const verifyProducts = await electronAPI.database.getProducts();
              console.log('🔍 Verification - Products in DB after sync:', verifyProducts.length);
              
              if (verifyProducts.length > 0) {
                console.log('📝 Sample verified product:', {
                  id: verifyProducts[0].id,
                  name: verifyProducts[0].name,
                  sellingPrice: verifyProducts[0].sellingPrice
                });
              }
            }
          } else {
            console.log('❌ No syncProducts method available in Electron API');
          }
          
          console.log('✅ ===== getAllProducts SUCCESS =====');
          return products;
        } catch (apiError) {
          console.error('❌ API call failed:', apiError);
          console.error('❌ API error response:', apiError.response?.data);
          console.error('❌ API error status:', apiError.response?.status);
          throw apiError;
        }
      } else {
        console.log('📴 OFFLINE: Getting from SQLite...');
        if (electronAPI.database?.getProducts) {
          const localProducts = await electronAPI.database.getProducts();
          console.log('📊 Local products found:', localProducts?.length);
          if (localProducts.length > 0) {
            console.log('📝 Sample local product:', {
              id: localProducts[0].id,
              name: localProducts[0].name,
              sellingPrice: localProducts[0].sellingPrice
            });
          }
          console.log('✅ ===== getAllProducts OFFLINE SUCCESS =====');
          return localProducts;
        }
        console.log('❌ No getProducts method available');
        throw new Error('No local product data available offline');
      }
    } catch (error) {
      console.error('❌ ===== getAllProducts FAILED =====');
      console.error('❌ Error details:', error);
      
      // Fallback: Try local SQLite even if online request fails
      if (electronAPI.database?.getProducts) {
        try {
          console.log('🔄 Fallback: Trying local SQLite...');
          const localProducts = await electronAPI.database.getProducts();
          console.log('✅ Using local product data as fallback:', localProducts?.length);
          return localProducts;
        } catch (localError) {
          console.error('❌ Local products also failed:', localError);
        }
      }
      
      throw error;
    }
  },

  async createProduct(productData) {
    try {
      console.log('🔄 createProduct called:', productData);
      // Generate temporary ID for offline use
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const productWithTempId = {
        ...productData,
        id: tempId,
        isLocal: true,
        createdAt: new Date().toISOString()
      };
      
      // First create locally for immediate response
      if (electronAPI.database?.createProduct) {
        const localProduct = await electronAPI.database.createProduct(productWithTempId);
        
        // If online, also create via API
        if (navigator.onLine) {
          try {
            const response = await window.axios.post('/products/create', productData);
            const apiProduct = response.data;
            
            // Update local record with real ID from API
            if (electronAPI.database?.updateProductId) {
              await electronAPI.database.updateProductId(tempId, apiProduct.id);
            }
            
            return apiProduct;
          } catch (apiError) {
            console.error('API create failed, keeping local product:', apiError);
            // Mark for sync later
            if (electronAPI.database?.markProductForSync) {
              await electronAPI.database.markProductForSync(tempId, 'create', productData);
            }
            return localProduct;
          }
        } else {
          // Offline: mark for sync creation later
          if (electronAPI.database?.markProductForSync) {
            await electronAPI.database.markProductForSync(tempId, 'create', productData);
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
      if (electronAPI.database?.updateProduct) {
        const localUpdate = await electronAPI.database.updateProduct(productId, productData);
        
        // If online, also update the API
        if (navigator.onLine) {
          try {
            const response = await window.axios.put(`/products/${productId}`, productData);
            
            // Mark local update as synced
            if (electronAPI.database?.markProductSynced) {
              await electronAPI.database.markProductSynced(productId);
            }
            
            return response.data;
          } catch (apiError) {
            console.error('API update failed, keeping local changes:', apiError);
            // Mark for sync later
            if (electronAPI.database?.markProductForSync) {
              await electronAPI.database.markProductForSync(productId, 'update', productData);
            }
            return localUpdate;
          }
        } else {
          // Offline: mark for sync update later
          if (electronAPI.database?.markProductForSync) {
            await electronAPI.database.markProductForSync(productId, 'update', productData);
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
      if (electronAPI.database?.deleteProduct) {
        const localDelete = await electronAPI.database.deleteProduct(productId);
        
        // If online, also delete from API
        if (navigator.onLine) {
          try {
            const response = await window.axios.delete(`/products/${productId}`);
            
            // Permanently remove from local DB after successful API deletion
            if (electronAPI.database?.permanentlyDeleteProduct) {
              await electronAPI.database.permanentlyDeleteProduct(productId);
            }
            
            return response.data;
          } catch (apiError) {
            console.error('API delete failed, keeping local deletion:', apiError);
            // Mark for sync deletion later
            if (electronAPI.database?.markProductForSync) {
              await electronAPI.database.markProductForSync(productId, 'delete');
            }
            return localDelete;
          }
        } else {
          // Offline: mark for sync deletion later
          if (electronAPI.database?.markProductForSync) {
            await electronAPI.database.markProductForSync(productId, 'delete');
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

  async searchProducts(query) {
    try {
      if (electronAPI.database?.searchProducts) {
        return await electronAPI.database.searchProducts(query);
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

  async getProductById(productId) {
    try {
      if (electronAPI.database?.getProductById) {
        const localProduct = await electronAPI.database.getProductById(productId);
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
  },

  // DEBUG METHODS
  async debugCheckDatabase() {
    try {
      console.log('🔍 DEBUG - Checking database state...');
      console.log('📡 Online status:', navigator.onLine);
      console.log('💻 Electron API available:', !!electronAPI.database);
      
      if (electronAPI.database?.getProducts) {
        console.log('🔄 Fetching products from SQLite...');
        const localProducts = await electronAPI.database.getProducts();
        console.log('📊 Products in SQLite:', localProducts);
        console.log('🔢 Count:', localProducts?.length);
        return localProducts;
      } else {
        console.log('❌ No database API available');
        return [];
      }
    } catch (error) {
      console.error('🔴 Debug check failed:', error);
      return { error: error.message };
    }
  },

  async debugCheckConnection() {
    try {
      console.log('🔍 DEBUG - Checking database connection...');
      if (electronAPI.database?.debugCheckConnection) {
        const result = await electronAPI.database.debugCheckConnection();
        console.log('🔗 Connection result:', result);
        return result;
      }
      return { success: false, error: 'No debug method available' };
    } catch (error) {
      console.error('🔴 Connection check failed:', error);
      return { success: false, error: error.message };
    }
  },

  async debugTestSync() {
    try {
      console.log('🧪 DEBUG - Testing sync functionality...');
      if (electronAPI.database?.debugTestSync) {
        const result = await electronAPI.database.debugTestSync();
        console.log('🎯 Test sync result:', result);
        return result;
      }
      return { success: false, error: 'No test sync method available' };
    } catch (error) {
      console.error('🔴 Test sync failed:', error);
      return { success: false, error: error.message };
    }
  },

  async debugTraceSyncFlow() {
    console.log('🔍 ===== DEBUG TRACE SYNC FLOW =====');
    
    try {
      // Step 1: Check initial state
      console.log('📊 Step 1 - Initial DB state:');
      const initialProducts = await electronAPI.database.getProducts();
      console.log('   Initial products in DB:', initialProducts.length);
      
      // Step 2: Make API call
      console.log('📡 Step 2 - Making API call...');
      const response = await window.axios.get('/products');
      console.log('   API response status:', response.status);
      console.log('   API products count:', response.data.products?.length);
      console.log('   First product sample:', response.data.products?.[0]);
      
      // Step 3: Check if syncProducts method exists
      console.log('🔧 Step 3 - Checking syncProducts method...');
      console.log('   syncProducts available:', !!electronAPI.database?.syncProducts);
      
      if (electronAPI.database?.syncProducts) {
        // Step 4: Call syncProducts
        console.log('💾 Step 4 - Calling syncProducts...');
        const products = response.data.products;
        console.log('   Products being sent to sync:', products.length);
        console.log('   First product structure:', {
          id: products[0]?.id,
          name: products[0]?.name,
          sellingPrice: products[0]?.sellingPrice,
          keys: Object.keys(products[0] || {})
        });
        
        const syncResult = await electronAPI.database.syncProducts(products);
        console.log('   Sync result:', syncResult);
        
        // Step 5: Verify sync worked
        console.log('✅ Step 5 - Verifying sync...');
        const finalProducts = await electronAPI.database.getProducts();
        console.log('   Final products in DB:', finalProducts.length);
        console.log('   First product in DB:', finalProducts[0]);
        
        return {
          success: true,
          apiCount: products.length,
          syncResult: syncResult,
          finalDbCount: finalProducts.length
        };
      } else {
        console.log('❌ syncProducts method not available!');
        return { success: false, error: 'syncProducts method not available' };
      }
    } catch (error) {
      console.error('❌ Debug trace failed:', error);
      return { success: false, error: error.message };
    }
  },

  async debugClearDatabase() {
    try {
      console.log('🧹 DEBUG - Clearing database...');
      if (electronAPI.database?.debugClearDatabase) {
        const result = await electronAPI.database.debugClearDatabase();
        console.log('✅ Clear result:', result);
        return result;
      }
      return { success: false, error: 'No clear method available' };
    } catch (error) {
      console.error('🔴 Clear failed:', error);
      return { success: false, error: error.message };
    }
  }
};

export default productService;
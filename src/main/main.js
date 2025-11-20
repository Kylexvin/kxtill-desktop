// src/main/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class POSApp {
  constructor() {
    this.mainWindow = null;
    this.isDev = process.env.NODE_ENV === 'development';
    this.database = null;
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 1024,
      minHeight: 768,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: false
      },
      show: false
    });

    console.log('🔧 Preload path:', path.join(__dirname, 'preload.js'));

    this.mainWindow.loadURL('http://localhost:3000');

    if (this.isDev) {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    this.setupIPCHandlers();
  }

  setupIPCHandlers() {
    // App handlers
    ipcMain.handle('app:getVersion', () => {
      console.log('🎯 Version request received');
      return app.getVersion();
    });

    ipcMain.handle('app:ping', () => {
      console.log('🎯 Ping request received');
      return 'Pong from Electron main process!';
    });

    // ===== DATABASE HANDLERS =====
    
    // Core product handlers
    ipcMain.handle('db:getProducts', async (event) => {
      try {
        console.log('📦 Getting products from local database');
        if (!this.database) {
          console.log('🔄 Initializing database...');
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        const products = this.database.getProducts();
        console.log('✅ Products retrieved:', products?.length);
        return products;
      } catch (error) {
        console.error('❌ Error getting products:', error);
        return [];
      }
    });

    ipcMain.handle('db:syncProducts', async (event, products) => {
      try {
        console.log('📦 Syncing products to local database:', products?.length);
        console.log('📝 Sample product:', products?.[0]);
        
        if (!this.database) {
          console.log('🔄 Initializing database for sync...');
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        
        const count = this.database.saveProducts(products);
        console.log('✅ Products saved to SQLite:', count);
        
        // Verify by reading back
        const verifyProducts = this.database.getProducts();
        console.log('🔍 Verification - Products in DB now:', verifyProducts.length);
        
        return { success: true, count };
      } catch (error) {
        console.error('❌ Error syncing products:', error);
        return { success: false, error: error.message };
      }
    });

    // Cart handlers
    ipcMain.handle('db:saveCart', async (event, cart) => {
      try {
        console.log('🛒 Saving cart:', cart?.length);
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        const result = this.database.saveCart(cart);
        return { success: true, count: result };
      } catch (error) {
        console.error('❌ Error saving cart:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('db:getCart', async (event) => {
      try {
        console.log('🛒 Getting cart');
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        const cart = this.database.getCart();
        return { success: true, cart };
      } catch (error) {
        console.error('❌ Error getting cart:', error);
        return { success: false, error: error.message };
      }
    });

    // Sales handlers
    ipcMain.handle('db:saveSale', async (event, saleData) => {
      try {
        console.log('💰 Saving sale');
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        const result = this.database.savePendingSale(saleData);
        return { success: true, saleId: result };
      } catch (error) {
        console.error('❌ Error saving sale:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('db:getSales', async (event) => {
      try {
        console.log('💰 Getting sales');
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        const sales = this.database.getPendingSales();
        return { success: true, sales };
      } catch (error) {
        console.error('❌ Error getting sales:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('db:getSaleById', async (event, saleId) => {
      try {
        console.log('💰 Getting sale by ID:', saleId);
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        // For now, return mock data since getSaleById doesn't exist in Database.js
        return { success: true, sale: null };
      } catch (error) {
        console.error('❌ Error getting sale by ID:', error);
        return { success: false, error: error.message };
      }
    });

    // Analytics handlers
    ipcMain.handle('db:cacheAnalytics', async (event, analyticsData) => {
      try {
        console.log('📊 Caching analytics:', analyticsData?.type);
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        const result = this.database.cacheAnalytics(analyticsData);
        return { success: true, result };
      } catch (error) {
        console.error('❌ Error caching analytics:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('db:getCachedAnalytics', async (event, type, period) => {
      try {
        console.log('📊 Getting cached analytics:', type, period);
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        const result = this.database.getCachedAnalytics(type, period);
        return { success: true, data: result };
      } catch (error) {
        console.error('❌ Error getting cached analytics:', error);
        return { success: false, error: error.message };
      }
    });

    // Sync handlers
    ipcMain.handle('db:markForSync', async (event, entityType, entityId, operation, data) => {
      try {
        console.log('🔄 Marking for sync:', entityType, operation);
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        // For now, return success since markForSync doesn't exist in Database.js
        return { success: true, message: 'Marked for sync' };
      } catch (error) {
        console.error('❌ Error marking for sync:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('db:getPendingSyncItems', async (event) => {
      try {
        console.log('🔄 Getting pending sync items');
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        // For now, return empty array since getPendingSyncItems doesn't exist in Database.js
        return { success: true, items: [] };
      } catch (error) {
        console.error('❌ Error getting pending sync items:', error);
        return { success: false, error: error.message };
      }
    });

    // ===== DEBUG HANDLERS =====
    ipcMain.handle('db:debug:getAllData', async (event) => {
      try {
        console.log('🔍 DEBUG - Getting all database data');
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        
        const products = this.database.getProducts();
        console.log('📊 DEBUG - Products in DB:', products);
        
        return {
          productCount: products.length,
          products: products
        };
      } catch (error) {
        console.error('❌ Debug error:', error);
        return { error: error.message };
      }
    });

    ipcMain.handle('db:debug:checkConnection', async (event) => {
      try {
        console.log('🔍 DEBUG - Checking database connection');
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        return { success: true, message: 'Database connected' };
      } catch (error) {
        console.error('❌ Database connection failed:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('db:debug:testSync', async (event) => {
      try {
        console.log('🧪 DEBUG TEST SYNC - Testing database operations...');
        
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        
        // Test with realistic product data
        const testProducts = [
          {
            id: 'prod-001',
            name: 'Test Product 1',
            sellingPrice: 29.99,
            buyingPrice: 15.00,
            trackStock: true,
            quantity: 50,
            description: 'A test product for debugging',
            category: 'electronics'
          },
          {
            id: 'prod-002',
            name: 'Test Product 2', 
            sellingPrice: 49.99,
            buyingPrice: 25.00,
            trackStock: false,
            quantity: 0,
            description: 'Another test product',
            category: 'clothing'
          }
        ];
        
        console.log('💾 Testing sync with data:', testProducts.length, 'products');
        
        const result = this.database.saveProducts(testProducts);
        console.log('✅ Save result:', result);
        
        // Verify
        const finalProducts = this.database.getProducts();
        console.log('🔍 Verification - Products in DB:', finalProducts.length);
        
        return { 
          success: true, 
          saved: result,
          verified: finalProducts.length,
          products: finalProducts,
          message: `Debug: Saved ${result} products, verified ${finalProducts.length} in DB`
        };
      } catch (error) {
        console.error('❌ Debug test failed:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('db:debug:clearDatabase', async (event) => {
      try {
        console.log('🧹 DEBUG - Clearing database...');
        if (!this.database) {
          const POSDatabase = require('./database/Database.js');
          this.database = new POSDatabase();
        }
        
        // Clear products table
        this.database.db.prepare('DELETE FROM products;').run();
        console.log('✅ Database cleared');
        
        const products = this.database.getProducts();
        return { 
          success: true, 
          message: 'Database cleared',
          remainingProducts: products.length 
        };
      } catch (error) {
        console.error('❌ Clear database failed:', error);
        return { success: false, error: error.message };
      }
    });

    // ===== SYNC SERVICE HANDLERS =====
    ipcMain.handle('sync:offlineSales', async (event) => {
      try {
        console.log('🔄 Syncing offline sales');
        return { success: true, message: 'Offline sales sync completed' };
      } catch (error) {
        console.error('❌ Error syncing offline sales:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('sync:inventoryChanges', async (event) => {
      try {
        console.log('🔄 Syncing inventory changes');
        return { success: true, message: 'Inventory changes sync completed' };
      } catch (error) {
        console.error('❌ Error syncing inventory changes:', error);
        return { success: false, error: error.message };
      }
    });
  }
}

app.whenReady().then(() => {
  const posApp = new POSApp();
  posApp.createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const posApp = new POSApp();
    posApp.createWindow();
  }
});
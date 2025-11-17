// src/main/main.js
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import POSDatabase from './database/Database.js'; // ADD THIS IMPORT

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class POSApp {
  constructor() {
    this.mainWindow = null;
    this.isDev = process.env.NODE_ENV === 'development';
    this.database = new POSDatabase(); // INITIALIZE DATABASE
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
    // Your existing handlers
    ipcMain.handle('app:getVersion', () => {
      console.log('🎯 Version request received');
      return app.getVersion();
    });

    ipcMain.handle('app:ping', () => {
      console.log('🎯 Ping request received');
      return 'Pong from Electron main process!';
    });

    // DATABASE IPC HANDLERS
    ipcMain.handle('db:syncProducts', async (event, products) => {
      try {
        console.log('📦 Syncing products to local database:', products?.length);
        const count = this.database.saveProducts(products);
        return { success: true, count };
      } catch (error) {
        console.error('Error syncing products:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('db:getProducts', async (event) => {
      try {
        console.log('📦 Getting products from local database');
        const products = this.database.getProducts();
        return products;
      } catch (error) {
        console.error('Error getting products:', error);
        return [];
      }
    });

    ipcMain.handle('db:saveCart', async (event, cart) => {
      try {
        console.log('🛒 Saving cart to database:', cart?.length, 'items');
        const count = this.database.saveCart(cart);
        return { success: true, count };
      } catch (error) {
        console.error('Error saving cart:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('db:getCart', async (event) => {
      try {
        console.log('🛒 Getting cart from database');
        const cart = this.database.getCart();
        return cart;
      } catch (error) {
        console.error('Error getting cart:', error);
        return [];
      }
    });

    ipcMain.handle('db:saveSale', async (event, saleData) => {
      try {
        console.log('💰 Saving sale to database');
        const result = this.database.savePendingSale(saleData);
        return { success: true, saleId: result };
      } catch (error) {
        console.error('Error saving sale:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('db:getSales', async (event) => {
      try {
        console.log('💰 Getting sales from database');
        const sales = this.database.getPendingSales();
        return sales;
      } catch (error) {
        console.error('Error getting sales:', error);
        return [];
      }
    });

    ipcMain.handle('db:getSaleById', async (event, saleId) => {
      try {
        console.log('💰 Getting sale by ID:', saleId);
        // For now, return first sale or null - you can implement this properly later
        const sales = this.database.getPendingSales();
        const sale = sales.find(s => s.id == saleId || s.localId === saleId);
        return sale || null;
      } catch (error) {
        console.error('Error getting sale by ID:', error);
        return null;
      }
    });

    ipcMain.handle('db:cacheAnalytics', async (event, analyticsData) => {
      try {
        console.log('📊 Caching analytics data:', analyticsData?.type);
        this.database.cacheAnalytics(analyticsData);
        return { success: true };
      } catch (error) {
        console.error('Error caching analytics:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('db:getCachedAnalytics', async (event, type, period) => {
      try {
        console.log('📊 Getting cached analytics:', type, period);
        const data = this.database.getCachedAnalytics(type, period);
        return data;
      } catch (error) {
        console.error('Error getting cached analytics:', error);
        return null;
      }
    });

    ipcMain.handle('db:markForSync', async (event, entityType, entityId, operation, data) => {
      try {
        console.log('🔄 Marking for sync:', entityType, entityId, operation);
        // For now, just log - implement proper sync queue later
        console.log('Sync data:', data);
        return { success: true };
      } catch (error) {
        console.error('Error marking for sync:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('db:getPendingSyncItems', async (event) => {
      try {
        console.log('🔄 Getting pending sync items');
        // For now, return empty array - implement proper sync queue later
        return [];
      } catch (error) {
        console.error('Error getting pending sync items:', error);
        return [];
      }
    });

    // SYNC HANDLERS
    ipcMain.handle('sync:offlineSales', async (event) => {
      try {
        console.log('🔄 Syncing offline sales');
        // TODO: Implement sales sync logic
        const pendingSales = this.database.getPendingSales();
        console.log(`Found ${pendingSales.length} sales to sync`);
        return { success: true, synced: 0, pending: pendingSales.length };
      } catch (error) {
        console.error('Error syncing sales:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('sync:inventoryChanges', async (event) => {
      try {
        console.log('🔄 Syncing inventory changes');
        // TODO: Implement inventory sync logic
        return { success: true, synced: 0 };
      } catch (error) {
        console.error('Error syncing inventory:', error);
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
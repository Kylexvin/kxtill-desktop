// src/main/preload.js
const { contextBridge, ipcRenderer } = require('electron');

console.log('🎯 Preload script loaded!');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Existing methods
  getVersion: () => {
    console.log('📡 getVersion called from renderer');
    return ipcRenderer.invoke('app:getVersion');
  },
  ping: () => {
    console.log('📡 ping called from renderer');
    return ipcRenderer.invoke('app:ping');
  },
  
  // Database methods
  database: {
    // Product methods
    syncProducts: (products) => {
      console.log('📡 syncProducts called from renderer:', products?.length);
      return ipcRenderer.invoke('db:syncProducts', products);
    },
    getProducts: () => {
      console.log('📡 getProducts called from renderer');
      return ipcRenderer.invoke('db:getProducts');
    },
    
    // Cart methods  
    saveCart: (cart) => {
      console.log('📡 saveCart called from renderer:', cart?.length);
      return ipcRenderer.invoke('db:saveCart', cart);
    },
    getCart: () => {
      console.log('📡 getCart called from renderer');
      return ipcRenderer.invoke('db:getCart');
    },
    
    // Sales methods
    saveSale: (saleData) => {
      console.log('📡 saveSale called from renderer');
      return ipcRenderer.invoke('db:saveSale', saleData);
    },
    getSales: () => {
      console.log('📡 getSales called from renderer');
      return ipcRenderer.invoke('db:getSales');
    },
    getSaleById: (saleId) => {
      console.log('📡 getSaleById called from renderer:', saleId);
      return ipcRenderer.invoke('db:getSaleById', saleId);
    },
    
    // Analytics methods
    cacheAnalytics: (analyticsData) => {
      console.log('📡 cacheAnalytics called from renderer:', analyticsData?.type);
      return ipcRenderer.invoke('db:cacheAnalytics', analyticsData);
    },
    getCachedAnalytics: (type, period) => {
      console.log('📡 getCachedAnalytics called from renderer:', type, period);
      return ipcRenderer.invoke('db:getCachedAnalytics', type, period);
    },
    
    // Sync methods
    markForSync: (entityType, entityId, operation, data) => {
      console.log('📡 markForSync called from renderer:', entityType, operation);
      return ipcRenderer.invoke('db:markForSync', entityType, entityId, operation, data);
    },
    getPendingSyncItems: () => {
      console.log('📡 getPendingSyncItems called from renderer');
      return ipcRenderer.invoke('db:getPendingSyncItems');
    }
  },
  
  // Sync service methods
  sync: {
    syncOfflineSales: () => {
      console.log('📡 syncOfflineSales called from renderer');
      return ipcRenderer.invoke('sync:offlineSales');
    },
    syncInventoryChanges: () => {
      console.log('📡 syncInventoryChanges called from renderer');
      return ipcRenderer.invoke('sync:inventoryChanges');
    }
  }
});

console.log('✅ electronAPI exposed to window');
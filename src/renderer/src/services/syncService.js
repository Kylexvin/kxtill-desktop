// src/services/syncService.js
const syncService = {
  async syncPendingOperations() {
    if (!navigator.onLine) return;
    
    try {
      // Get pending operations from SQLite
      const pendingOps = await window.electronAPI.database.getPendingOperations();
      
      for (const op of pendingOps) {
        try {
          switch (op.operation) {
            case 'create':
              await window.axios.post('/products', op.data);
              break;
            case 'update':
              await window.axios.put(`/products/${op.productId}`, op.data);
              break;
            case 'delete':
              await window.axios.delete(`/products/${op.productId}`);
              break;
          }
          // Mark as synced
          await window.electronAPI.database.markOperationSynced(op.id);
        } catch (error) {
          console.error(`Failed to sync operation ${op.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
};

// Call this when app comes online
window.addEventListener('online', () => {
  syncService.syncPendingOperations();
});
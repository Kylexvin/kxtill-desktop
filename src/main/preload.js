const { contextBridge, ipcRenderer } = require('electron');

console.log('🎯 Preload script loaded!');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => {
    console.log('📡 getVersion called from renderer');
    return ipcRenderer.invoke('app:getVersion');
  },
  ping: () => {
    console.log('📡 ping called from renderer');
    return ipcRenderer.invoke('app:ping');
  }
});

console.log('✅ electronAPI exposed to window');
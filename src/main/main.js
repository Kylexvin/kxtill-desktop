import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class POSApp {
  constructor() {
    this.mainWindow = null;
    this.isDev = process.env.NODE_ENV === 'development';
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
        preload: path.join(__dirname, 'preload.js'), // CHANGED to .js
        webSecurity: false
      },
      show: false
    });

    console.log('🔧 Preload path:', path.join(__dirname, 'preload.js')); // CHANGED to .js

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
    ipcMain.handle('app:getVersion', () => {
      console.log('🎯 Version request received');
      return app.getVersion();
    });

    ipcMain.handle('app:ping', () => {
      console.log('🎯 Ping request received');
      return 'Pong from Electron main process!';
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
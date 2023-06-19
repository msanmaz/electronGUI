const { app, BrowserWindow } = require('electron');
const { join } = require('path');

const handleBluetoothEvents = require('./bluetoothEvents');
const handleAppEvents = require('./appEvents');

let win = null;

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    width: 1024,
    height: 768,
    webPreferences: {
      preload: join(__dirname, '../electron/preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(join(__dirname, '../dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  }

  handleBluetoothEvents(win);
}

app.whenReady().then(createWindow);

handleAppEvents(win, createWindow, BrowserWindow);

module.exports = win;

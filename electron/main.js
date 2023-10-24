const { app, BrowserWindow,session } = require('electron');
const { join } = require('path');

const handleBluetoothEvents = require('./bluetoothEvents');
const handleAppEvents = require('./appEvents');


let win = null;

if (process.platform === "linux"){
  app.commandLine.appendSwitch("enable-experimental-web-platform-features", true);
} 
app.commandLine.appendSwitch("enable-web-bluetooth", true);


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
      enableWebSerial: true
    },
  });

  if (app.isPackaged) {
    win.loadFile(join(__dirname, '../dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  }

  win.webContents.session.on('select-usb-device', (event, details, callback) => {
    console.log('select-usb-device FIRED WITH', details.deviceList);
    if (details.deviceList.length > 0) {        
      callback(details.deviceList[0].deviceId);      
    }
  })

  win.webContents.session.on('usb-device-added', (event, device) => {
    console.log('usb-device-added FIRED WITH', device);
    event.preventDefault();
  })

  win.webContents.session.on('usb-device-removed', (event, device) => {
    console.log('usb-device-removed FIRED WITH', device);
    event.preventDefault();
  })
  
  win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    console.log(`In PermissionCheckHandler with permission ${permission} from ${requestingOrigin}`, details);
    return true;
  });


  win.webContents.session.setDevicePermissionHandler((details) => {
    console.log(`In DevicePermissionHandlerfor ${details.deviceType} from ${details.origin}`, details.device);
    win.webContents.send('get-usb-device-list', details);
    return true;
  });

  handleBluetoothEvents(win);
  // handleSerialPortEvents(win);
}

app.whenReady().then(() => {
  session.defaultSession.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault();
    const selectedPortId = portList[0]?.portId;
    console.log(portList,'list')
    callback(selectedPortId);
  });
  createWindow()
});

handleAppEvents(win, createWindow, BrowserWindow);


module.exports = win;

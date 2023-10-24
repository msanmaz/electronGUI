const { ipcMain } = require('electron');

function handleBluetoothEvents(win) {
  let selectBluetoothCallback;

  win.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault();
    selectBluetoothCallback = callback;
    console.log(deviceList,'deviceList')
    const filteredDeviceList = deviceList.filter(device => {
      return !device.deviceName.toLowerCase().includes('unknown or unsupported device');
    });
    win.webContents.send('update-device-list', filteredDeviceList);
  });

  ipcMain.on('bluetooth-pairing-request', (event, device) => {
    if (selectBluetoothCallback) {
      selectBluetoothCallback(device.deviceId);
    }
  });

  ipcMain.on('cancel-bluetooth-request', (event, response) => {
    console.log(event, response)
    selectBluetoothCallback('');
  });
}

module.exports = handleBluetoothEvents;

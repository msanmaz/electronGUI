const { ipcMain } = require('electron');
const {SerialPort} = require('serialport');

async function handleSerialPortEvents(win) {
    try {
      const ports = await SerialPort.list();
      console.log(ports)
      win.webContents.send('update-serial-ports', ports);
    } catch (err) {
      console.error('Error listing serial ports', err);
    }
    
    ipcMain.on('refresh-serial-ports', async (event) => {
      try {
        const ports = await SerialPort.list();
        event.reply('update-serial-ports', ports);
      } catch (err) {
        console.error('Error refreshing serial ports', err);
      }
    });
  }
  
  module.exports = handleSerialPortEvents;
  
const {
    contextBridge,
    ipcRenderer,
} = require("electron");


contextBridge.exposeInMainWorld("electron", {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, callback) => {
        const newCallback = (_, data) => callback(data);
        ipcRenderer.on(channel, newCallback);
        return () => ipcRenderer.removeListener(channel, newCallback);
    },
    off: (channel, callback) => {
        ipcRenderer.removeListener(channel, callback);
    },
});

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector);
      if (element) element.innerText = text;
    };
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type]);
    }
  });
  



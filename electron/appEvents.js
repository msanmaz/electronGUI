const { app } = require('electron');

function handleAppEvents(win, createWindow, BrowserWindow) {
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin'){
            app.quit();}
    });

    app.on('second-instance', () => {
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });

    app.on('activate', () => {
        const allWindows = BrowserWindow.getAllWindows();
        if (allWindows.length) {
            allWindows[0].focus();
        } else {
            createWindow();
        }
    });
}

module.exports = handleAppEvents;


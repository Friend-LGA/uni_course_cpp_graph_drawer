import { app, BrowserWindow, Menu, MenuItem, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as parser from './parser';
import { Graph, Vertex, Edge } from './graph';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nativeWindowOpen: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('../index.html');
}

function createMenu() {
  const appMenu = new MenuItem({ role: 'appMenu' });

  const fileMenu = new MenuItem({
    role: 'fileMenu',
    submenu: [
      {
        label: 'Open Graph JSON...',
        click() {
          openFile();
        },
        accelerator: 'CmdOrCtrl+o',
      }, {
        role: 'recentDocuments',
      }
    ]
  });

  const viewMenu = new MenuItem({
    role: 'viewMenu',
    submenu: [
      { role: 'toggleDevTools' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { role: 'resetZoom' }
    ]
  });

  const windowMenu = new MenuItem({ role: 'windowMenu' });

  const template = [appMenu, fileMenu, viewMenu, windowMenu];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length == 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('open-file', (event) => {
  openFile();
});

function openFile() {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'JSON', extensions: ['json'] }
    ]
  }).then((result) => {
    const filePath = result.filePaths[0];
    if (filePath && filePath.length > 0) {
      const graph = parser.parseJSON(filePath);
      const win = BrowserWindow.getFocusedWindow();
      win.webContents.send('create-or-replace-canvas', graph);
    }
  }).catch((err: Error) => {
    const messageBoxOptions = {
      type: "error",
      title: 'Failed to Open Graph JSON',
      message: err.message
    };
    dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), messageBoxOptions);
  });
}

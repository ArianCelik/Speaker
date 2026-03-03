import { app, shell, BrowserWindow, Menu, Tray } from 'electron'
import { spawn } from "child_process";
import { join } from 'path'
import kill from 'tree-kill';
import { electronApp, optimizer } from '@electron-toolkit/utils'

let bunProcess: any;
let mainWindow: BrowserWindow;    

const createTray = () => {
	const tray: Tray = new Tray(join(__dirname, '../../resources/headset.png'));
	const contextMenu: Menu = Menu.buildFromTemplate([
		{label: 'Close', type: 'normal', click: () => { app.quit(); }}
	]);
	tray.setToolTip('Speaks');
	tray.setContextMenu(contextMenu);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.ts'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/index.html`)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createTray()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('will-quit', () => {
  if (bunProcess?.pid) {
    kill(bunProcess.pid, 'SIGTERM', (err) => {
      if (err) {
        console.error('Fehler beim Killen:', err);
      }
    });
    process.exit(0);
  }
});


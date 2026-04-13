import { app, shell, BrowserWindow, Menu, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { ipcMain } from 'electron'

let status = 0;

if (!app.isPackaged) {
  app.commandLine.appendSwitch('ignore-certificate-errors')
}

const createTray = () => {
	const tray: Tray = new Tray(join(__dirname, '../../resources/headset.png'));
	const contextMenu: Menu = Menu.buildFromTemplate([
		{label: 'Close', type: 'normal', click: () => { app.quit(); }}
	]);
	tray.setToolTip('Speaker');
	tray.setContextMenu(contextMenu);
}

function createWindow(): void {
	const mainWindow = new BrowserWindow({
		width: 1400,
		height: 800,
		show: false,
		autoHideMenuBar: true,
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			sandbox: false,
			contextIsolation: true,
			nodeIntegration: false
		}
	})

	mainWindow.on('ready-to-show', () => {
		mainWindow!.show()
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

	mainWindow.on("close", function (e) {
		if(status == 0){
			if(mainWindow){
				console.log("Closing app...");
				e.preventDefault();
				mainWindow.webContents.send("app-close");
			}
		}
	})

	ipcMain.on("closed", () => {
		status = 1;
		mainWindow.close();
		if(process.platform !== 'darwin'){
			app.quit();
		}
	})
}

app.whenReady().then(() => {
	electronApp.setAppUserModelId('com.electron')

	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window)
	})

	createWindow()
	createTray()
})
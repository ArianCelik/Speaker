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

function startServer(){
  const projectRoot = app.getAppPath()
  const serverPath = join(projectRoot, 'src', 'server', 'server.js');

  bunProcess = spawn("bun", [serverPath], {
      stdio: "inherit",
      cwd: __dirname,
      env: process.env,
    });

    bunProcess.on('error', (err: Error) => {
      console.error('Bun konnte nicht gestartet werden:', err);
    });
    
    bunProcess.on('exit', (code: number | null) => {
      console.log(`Bun-Prozess wurde mit Code ${code} beendet`);
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createTray()
  startServer()
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


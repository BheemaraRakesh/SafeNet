import { app, BrowserWindow, ipcMain } from 'electron'
import { PythonShell } from 'python-shell'
import fs from 'fs'
import { PathLike } from 'original-fs'
import path from 'node:path'

process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let mainWindow: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

const createWindow = () => {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    center: true,
    show: false,
    minWidth: 1000,
    minHeight: 650,
    icon: path.join(process.env.PUBLIC, 'img/safenet-upscaled-logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.maximize()
  mainWindow.show()

  // Test active push message to Renderer-process.
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // mainWindow.loadFile('dist/index.html')
    mainWindow.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

ipcMain.on('inputfile', (_event, data) => {
  fs.copyFileSync(data.path, data.name)
  sendfile(data.name)

  console.log(data)
})

const sendfile = async (fileName: PathLike): Promise<void> => {
  let options: Object = {
    mode: "text",
    args: JSON.stringify(fileName)
  }

  try {
    let result = await PythonShell.run("./electron/prediction.py", options)
    result = JSON.parse(result[0])

    console.log(result)

    mainWindow?.webContents.send('messageFromMain', result)
  } catch (err) {
    console.error(err)
  }

  fs.unlink(fileName, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
}

// ------------ App related stuff -------------

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})
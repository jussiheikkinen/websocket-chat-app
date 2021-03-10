const { app, BrowserWindow } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')


//https://medium.com/@devesu/how-to-build-a-react-based-electron-app-d0f27413f17f

const index = `file://${path.join(__dirname, '../build/index.html')}`

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    }
  })

  //win.loadFile(isDev ? 'http://localhost:3000' : index)
  win.loadURL(isDev ? 'http://localhost:3000' : index)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

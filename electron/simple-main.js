const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Christmas Lights Estimator',
    show: false,
    alwaysOnTop: false,
    center: true,
    resizable: true,
    minimizable: true,
    maximizable: true,
    closable: true
  });

  // Try to load from different ports
  const tryLoad = async () => {
    const ports = [3000, 3001, 3002];
    
    for (const port of ports) {
      try {
        console.log(`Trying port ${port}...`);
        await mainWindow.loadURL(`http://localhost:${port}`);
        console.log(`✅ Connected to port ${port}`);
        mainWindow.show();
        mainWindow.focus();
        mainWindow.setAlwaysOnTop(true);
        setTimeout(() => {
          mainWindow.setAlwaysOnTop(false);
        }, 1000);
        return;
      } catch (error) {
        console.log(`Port ${port} not ready`);
      }
    }
    
    // If no server found, show error page
    mainWindow.loadURL(`data:text/html,
      <html>
        <head><title>Christmas Lights Estimator</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0;">
          <h1>🎄 Christmas Lights Estimator</h1>
          <p style="color: #666; font-size: 18px;">Server not found. Please start the server first:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px; max-width: 500px; margin-left: auto; margin-right: auto;">
            <p>1. Open a terminal in the project folder</p>
            <p>2. Run: <code style="background: #f5f5f5; padding: 5px;">npm run dev</code></p>
            <p>3. Then close and reopen this app</p>
          </div>
          <button onclick="location.reload()" style="background: #007acc; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Retry</button>
        </body>
      </html>
    `);
    mainWindow.show();
  };

  tryLoad();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

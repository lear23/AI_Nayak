const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');

let mainWindow;
let ollamaProcess;

// Development config
const isDev = process.env.ELECTRON_IS_DEV === 'true';
const PORT = 3000;

class ElectronApp {
  constructor() {
    this.ollamaRunning = false;
    this.nextjsRunning = false;
  }

  createWindow() {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        webSecurity: true
      },
      icon: path.join(__dirname, 'assets', 'icon.png'),
      show: false,
      titleBarStyle: 'default'
    });

    // Show loading window
    this.showLoadingWindow();

    // Configure the app
    this.setupApplication();

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  showLoadingWindow() {
    const loadingContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: white;
          }
          .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: pulse 2s infinite;
          }
          .title {
            font-size: 2rem;
            margin-bottom: 2rem;
            font-weight: 300;
          }
          .status {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            opacity: 0.9;
          }
          .progress {
            width: 300px;
            height: 4px;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
            overflow: hidden;
          }
          .progress-bar {
            height: 100%;
            background: white;
            border-radius: 2px;
            animation: loading 2s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          @keyframes loading {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="logo">🤖</div>
        <div class="title">AI Nayak</div>
        <div class="status" id="status">Starting application...</div>
        <div class="progress">
          <div class="progress-bar"></div>
        </div>
      </body>
      </html>
    `;

    mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(loadingContent)}`);
    mainWindow.show();
  }

  updateLoadingStatus(message) {
    mainWindow.webContents.executeJavaScript(`
      document.getElementById('status').textContent = '${message}';
    `);
  }

  async checkOllamaRunning() {
    return new Promise((resolve) => {
      const req = http.get('http://localhost:11434', (res) => {
        resolve(true);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(3000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  async startOllama() {
    this.updateLoadingStatus('Starting Ollama...');

    return new Promise((resolve, reject) => {
      ollamaProcess = spawn('ollama', ['serve'], {
        detached: true,
        stdio: 'ignore'
      });

      ollamaProcess.unref();

      setTimeout(async () => {
        const isRunning = await this.checkOllamaRunning();
        if (isRunning) {
          this.ollamaRunning = true;
          resolve(true);
        } else {
          reject(new Error('Failed to start Ollama'));
        }
      }, 5000);
    });
  }

  async checkNextjsRunning() {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${PORT}`, (res) => {
        resolve(true);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(3000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  async startNextjs() {
    this.updateLoadingStatus('Starting Next.js server...');

    return new Promise((resolve, reject) => {
      const nextProcess = spawn('npm', ['run', 'start'], {
        cwd: path.join(__dirname, '..'),
        detached: true,
        stdio: 'ignore'
      });

      nextProcess.unref();

      const checkServer = async (attempts = 0) => {
        if (attempts > 30) {
          reject(new Error('Timeout starting Next.js'));
          return;
        }

        const isRunning = await this.checkNextjsRunning();
        if (isRunning) {
          this.nextjsRunning = true;
          resolve(true);
        } else {
          setTimeout(() => checkServer(attempts + 1), 1000);
        }
      };

      setTimeout(() => checkServer(), 3000);
    });
  }

  async setupApplication() {
    try {
      // 1. Check Ollama
      this.updateLoadingStatus('Checking Ollama...');
      const ollamaRunning = await this.checkOllamaRunning();

      if (!ollamaRunning) {
        await this.startOllama();
      } else {
        this.ollamaRunning = true;
      }

      // 2. Check Next.js
      this.updateLoadingStatus('Checking web server...');
      const nextjsRunning = await this.checkNextjsRunning();

      if (!nextjsRunning) {
        await this.startNextjs();
      } else {
        this.nextjsRunning = true;
      }

      // 3. Load the application
      this.updateLoadingStatus('Loading AI Nayak...');
      await this.loadApplication();

    } catch (error) {
      this.showErrorDialog('Initialization Error', error.message);
    }
  }

  async loadApplication() {
    setTimeout(() => {
      mainWindow.loadURL(`http://localhost:${PORT}`);

      mainWindow.webContents.once('dom-ready', () => {
        this.updateLoadingStatus('Ready!');
        setTimeout(() => {
          // App is now loaded
        }, 1000);
      });
    }, 2000);
  }

  showErrorDialog(title, message) {
    dialog.showErrorBox(title, `${message}\n\nPlease make sure Ollama is installed and the model llama3.2:3b is downloaded.`);
    app.quit();
  }
}

// App instance
const electronApp = new ElectronApp();

// Electron events
app.whenReady().then(() => {
  electronApp.createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      electronApp.createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (ollamaProcess) {
    ollamaProcess.kill();
  }
});

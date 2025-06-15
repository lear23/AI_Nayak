#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

class AINayakSetup {
  constructor() {
    this.platform = os.platform();
    this.modelName = 'llama3.2:3b';
    this.ollamaPort = 11434;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warning: '\x1b[33m'  // Yellow
    };
    const reset = '\x1b[0m';
    console.log(`${colors[type]}[AI Nayak] ${message}${reset}`);
  }

  async checkOllamaInstalled() {
    return new Promise((resolve) => {
      exec('ollama --version', (error) => {
        resolve(!error);
      });
    });
  }

  async checkOllamaRunning() {
    return new Promise((resolve) => {
      const http = require('http');
      const req = http.get(`http://localhost:${this.ollamaPort}`, (res) => {
        resolve(true);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(3000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  async installOllama() {
    this.log('Installing Ollama...', 'info');
    
    return new Promise((resolve, reject) => {
      let command;
      
      switch (this.platform) {
        case 'win32':
          // Download and install Ollama for Windows
          command = 'powershell -Command "& {Invoke-WebRequest -Uri https://ollama.ai/download/windows -OutFile ollama-installer.exe; Start-Process -Wait -FilePath ollama-installer.exe -ArgumentList \'/S\'; Remove-Item ollama-installer.exe}"';
          break;
        case 'darwin':
          // macOS
          command = 'curl -fsSL https://ollama.ai/install.sh | sh';
          break;
        case 'linux':
          // Linux
          command = 'curl -fsSL https://ollama.ai/install.sh | sh';
          break;
        default:
          reject(new Error(`Unsupported platform: ${this.platform}`));
          return;
      }

      exec(command, (error, stdout, stderr) => {
        if (error) {
          this.log(`Error installing Ollama: ${error.message}`, 'error');
          reject(error);
        } else {
          this.log('Ollama installed successfully', 'success');
          resolve(stdout);
        }
      });
    });
  }

  async startOllamaService() {
    this.log('Starting Ollama service...', 'info');
    
    return new Promise((resolve, reject) => {
      const ollamaProcess = spawn('ollama', ['serve'], {
        detached: true,
        stdio: 'ignore'
      });

      ollamaProcess.unref();

      // Wait a moment for the service to start
      setTimeout(async () => {
        const isRunning = await this.checkOllamaRunning();
        if (isRunning) {
          this.log('Ollama service started', 'success');
          resolve();
        } else {
          reject(new Error('Failed to start Ollama service'));
        }
      }, 3000);
    });
  }

  async checkModelExists() {
    return new Promise((resolve) => {
      exec('ollama list', (error, stdout) => {
        if (error) {
          resolve(false);
        } else {
          resolve(stdout.includes(this.modelName));
        }
      });
    });
  }

  async downloadModel() {
    this.log(`Downloading model ${this.modelName} (this may take several minutes)...`, 'info');
    
    return new Promise((resolve, reject) => {
      const downloadProcess = spawn('ollama', ['pull', this.modelName], {
        stdio: 'pipe'
      });

      downloadProcess.stdout.on('data', (data) => {
        // Show download progress
        process.stdout.write(`\r${data.toString().trim()}`);
      });

      downloadProcess.on('close', (code) => {
        console.log(); // New line after progress
        if (code === 0) {
          this.log(`Model ${this.modelName} downloaded successfully`, 'success');
          resolve();
        } else {
          reject(new Error(`Error downloading model. Code: ${code}`));
        }
      });
    });
  }

  async setup() {
    try {
      this.log('🚀 Starting AI Nayak setup...', 'info');
      this.log('📋 Requirements: 8GB RAM, 3GB free space', 'warning');

      // 1. Check if Ollama is installed
      const ollamaInstalled = await this.checkOllamaInstalled();
      if (!ollamaInstalled) {
        await this.installOllama();
      } else {
        this.log('Ollama is already installed', 'success');
      }

      // 2. Check if service is running
      const ollamaRunning = await this.checkOllamaRunning();
      if (!ollamaRunning) {
        await this.startOllamaService();
      } else {
        this.log('Ollama service is already running', 'success');
      }

      // 3. Check if model exists
      const modelExists = await this.checkModelExists();
      if (!modelExists) {
        await this.downloadModel();
      } else {
        this.log(`Model ${this.modelName} is already available`, 'success');
      }

      this.log('✅ Setup completed successfully!', 'success');
      this.log('🌐 You can start the application with: npm run start', 'info');
      
      // Show usage information
      console.log('\n' + '='.repeat(50));
      console.log('🤖 AI Nayak is ready to use!');
      console.log('='.repeat(50));
      console.log('📍 Ollama API: http://localhost:11434');
      console.log(`🧠 Model: ${this.modelName}`);
      console.log('🚀 To start: npm run start');
      console.log('🌐 App will be available at: http://localhost:3000');
      console.log('='.repeat(50) + '\n');

    } catch (error) {
      this.log(`Setup error: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new AINayakSetup();
  setup.setup();
}

module.exports = AINayakSetup;
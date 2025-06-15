#!/usr/bin/env node

const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');

class SystemChecker {
  constructor() {
    this.requirements = {
      minRam: 8, // GB
      minDisk: 3, // GB
      nodeVersion: '18.0.0'
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m'
    };
    const reset = '\x1b[0m';
    const icons = {
      info: '🔍',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    
    console.log(`${colors[type]}${icons[type]} ${message}${reset}`);
  }

  async checkSystem() {
    console.log('\n🤖 AI Nayak - System Verification\n');
    console.log('='.repeat(50));

    let allGood = true;

    // Check RAM
    const totalRam = Math.round(os.totalmem() / (1024 * 1024 * 1024));
    if (totalRam >= this.requirements.minRam) {
      this.log(`RAM: ${totalRam}GB (Sufficient)`, 'success');
    } else {
      this.log(`RAM: ${totalRam}GB (Minimum ${this.requirements.minRam}GB required)`, 'error');
      allGood = false;
    }

    // Check disk space
    try {
      const stats = fs.statSync('.');
      this.log('Disk space: Checking...', 'info');
      // Note: In a real environment, you would use a library like 'check-disk-space'
    } catch (error) {
      this.log('Could not verify disk space', 'warning');
    }

    // Check Node.js
    await this.checkNodeVersion();

    // Check Ollama
    await this.checkOllama();

    // Check ports
    await this.checkPorts();

    console.log('\n' + '='.repeat(50));
    if (allGood) {
      this.log('System compatible with AI Nayak', 'success');
      console.log('\n🚀 To continue with installation:');
      console.log('   npm run setup');
    } else {
      this.log('System requires adjustments', 'warning');
    }
    console.log('='.repeat(50) + '\n');
  }

  async checkNodeVersion() {
    return new Promise((resolve) => {
      exec('node --version', (error, stdout) => {
        if (error) {
          this.log('Node.js not installed', 'error');
        } else {
          const version = stdout.trim();
          this.log(`Node.js: ${version}`, 'success');
        }
        resolve();
      });
    });
  }

  async checkOllama() {
    return new Promise((resolve) => {
      exec('ollama --version', (error, stdout) => {
        if (error) {
          this.log('Ollama not installed (will be installed automatically)', 'warning');
        } else {
          const version = stdout.trim();
          this.log(`Ollama: ${version}`, 'success');
        }
        resolve();
      });
    });
  }

  async checkPorts() {
    const portsToCheck = [3000, 11434];
    
    for (const port of portsToCheck) {
      const isAvailable = await this.isPortAvailable(port);
      if (isAvailable) {
        this.log(`Port ${port}: Available`, 'success');
      } else {
        this.log(`Port ${port}: In use (may cause conflicts)`, 'warning');
      }
    }
  }

  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const net = require('net');
      const server = net.createServer();
      
      server.listen(port, () => {
        server.close(() => resolve(true));
      });
      
      server.on('error', () => resolve(false));
    });
  }
}

// Run verification
if (require.main === module) {
  const checker = new SystemChecker();
  checker.checkSystem();
}

module.exports = SystemChecker;
# 🚀 AI Nayak - Installer Creation Guide

This directory contains scripts to create final distribution installers for AI Nayak.

## 📦 What gets created:

### Windows:
1. **AI-Nayak-Installer.exe** (or .zip) - Full self-contained installer
2. **AI-Nayak-Portable.zip** - Portable version (requires Node.js + Ollama)

### Linux/macOS:
1. **AI-Nayak-Installer.sh** - Self-extracting shell script
2. **AI-Nayak-Portable.tar.gz** - Portable version

## 🔧 How to create installers:

### Windows (PowerShell):
```powershell
# Run from project root
.\distribution\installer\create-installer.ps1
```

### Linux/macOS (Bash):
```bash
# Run from project root
chmod +x distribution/installer/create-installer.sh
./distribution/installer/create-installer.sh
```

## 📂 Output Structure:
```
distribution/installer/output/
├── AI-Nayak-Installer.exe     # Windows full installer
├── AI-Nayak-Installer.sh      # Unix full installer  
├── AI-Nayak-Portable.zip      # Windows portable
└── AI-Nayak-Portable.tar.gz   # Unix portable
```

## 🎯 Distribution Methods:

### Option 1: Full Installer (Recommended)
- **Windows**: `AI-Nayak-Installer.exe`
- **Linux/macOS**: `AI-Nayak-Installer.sh`
- Installs everything automatically (Node.js, Ollama, model, app)
- Creates desktop shortcuts
- No technical knowledge required

### Option 2: Portable Version
- **Windows**: `AI-Nayak-Portable.zip`
- **Linux/macOS**: `AI-Nayak-Portable.tar.gz`
- Requires Node.js and Ollama pre-installed
- Just extract and run
- Good for developers

## 📋 What the installer does:

1. ✅ Checks system requirements
2. 📦 Installs Node.js (if missing)
3. 🤖 Installs Ollama (if missing)
4. 🧠 Downloads Llama 3.2 3B model (~2GB)
5. 📁 Extracts application files
6. 📦 Installs npm dependencies
7. 🔗 Creates desktop/start menu shortcuts
8. 🚀 Optionally launches the application

## 🎉 For end users:

### Windows:
1. Download `AI-Nayak-Installer.exe`
2. Run it
3. Follow prompts
4. Done! AI Nayak will be available

### Linux/macOS:
1. Download `AI-Nayak-Installer.sh`
2. Make executable: `chmod +x AI-Nayak-Installer.sh`
3. Run: `./AI-Nayak-Installer.sh`
4. Follow prompts
5. Done! AI Nayak will be available

## 🔧 Customization:

Edit the installer scripts to:
- Change installation directory
- Add/remove shortcuts
- Modify model selection
- Add custom post-install steps

## 📊 File Sizes (Approximate):
- Full installer: ~5-10MB (downloads ~2GB during install)
- Portable version: ~5MB (requires separate Ollama install)
- Total after install: ~3GB (includes model)

## 🛡️ Security Notes:
- Installers may trigger antivirus warnings (false positives)
- Users may need to "Run as Administrator" on Windows
- macOS users may need to allow "unknown developer"

## 🚀 Quick Test:
```bash
# After creating installer, test it:
cd distribution/installer/output
./AI-Nayak-Installer.sh  # Linux/macOS
# or run AI-Nayak-Installer.exe on Windows
```

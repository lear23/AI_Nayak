# 🤖 AI Nayak - Simple Installation

**Your personal AI assistant with integrated Ollama**

## 🚀 Quick Installation (Recommended)

### Windows
```bash
# Download and run
PowerShell -ExecutionPolicy Bypass -File distribution/scripts/install-windows.ps1

```

### Linux/macOS
```bash
# Grant permission and run
chmod +x distribution/scripts/install-unix.sh
./distribution/scripts/install-unix.sh
```

### Installation with Node.js
```bash
# If you already have Node.js installed
node distribution/scripts/setup.js
```

## ✨  Features

- 🧠 **Ollama 3.2 3B** -  Lightweight and powerful AI model
- 🌐 **Interfaz web moderna** -  Built with Next.js
- ⚡ **Instalación automática** -  Everything configures itselfo
- 🔧 **Sin configuración manual** - Works out of the box
- 💾 **Ligero** - Only 3GB total size

## 📋  Minimum Requirements

- **SO**: Windows 10+, macOS 10.13+, Linux x64
- **RAM**: 8GB (recommended)
- **Espacio**: 3GB free
- **Internet**: Required for initial download

## 🎯 Usage

1. **Run the installer** according to your operating system
2. **Wait** for everything to download and install automatically
3. **Done!** Navegate to http://localhost:3000

## 🛠️ Useful Commands

```bash
# Start AI ELSA
npm run start

# Development mode
npm run dev

# Check Ollama
ollama list

# Stop Ollama
ollama stop
```

## 🔧 Troubleshooting

### Ollama no responde
```bash
# Restart Ollama service
ollama serve
```

### Port in use
```bash
# Change port in next.config.js
# Or close process using port 3000
```

### Model not found
```bash
# Download model manually
ollama pull llama3.2:3b
```

## 📱  Electron Version (Optional)

To create a desktop application:

```bash
# Install Electron dependencies
npm install --save-dev electron electron-builder

# Copy configuration
cp distribution/electron-package.json ./electron-package.json
cp distribution/electron-main.js ./electron-main.js

# Run as desktop app
npm run electron

# Create installer
npm run dist
```

## 🌐 API Endpoints

- **Chat**: `POST /api/chat`
- **Ollama**: `http://localhost:11434`
- **Web App**: `http://localhost:3000`

## 🎨 Customization

Edit files in src/app/ to customize:
- `page.tsx` - Página principal
- `api/chat/route.ts` - Lógica del chat
- `globals.css` - Estilos

## 📦 Project Structure

```
AI_Nayak/
├── src/app/              # Next.js application
├── distribution/         # Installation scripts
│   ├── scripts/         # Automatic installers
│   ├── installer/       # Installer files
│   └── electron-*.js    # Electron configuration
└── README.md            # This file
```

## 🤝 Support

If you have any issues:

1. Verify you meet the minimum requirements
2. Run the installer as administrator (Windows)
3. Check that ports 3000 and 11434 are available
4. Try restarting Ollama: ollama serve

## 📄 License

This project is open source. Use it freely.

---

**Enjoy your personal AI assistant! 🤖✨ 🤖✨**

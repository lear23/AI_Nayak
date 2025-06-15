#!/bin/bash
# AI Nayak - Universal Installer Creator for Unix/Linux/macOS

echo "🤖 AI Nayak - Universal Installer Creator"
echo "========================================"

PROJECT_ROOT=$(pwd)
INSTALLER_DIR="distribution/installer"
OUTPUT_DIR="$INSTALLER_DIR/output"
TEMP_DIR="$INSTALLER_DIR/temp"

# Clean previous builds
rm -rf "$OUTPUT_DIR" "$TEMP_DIR"
mkdir -p "$OUTPUT_DIR" "$TEMP_DIR"

echo "📦 Building application..."
npm run build

echo "📁 Creating installer package..."

# Create installer structure
mkdir -p "$TEMP_DIR/app"
cp -r src "$TEMP_DIR/app/"
cp -r public "$TEMP_DIR/app/"
cp -r .next "$TEMP_DIR/app/" 2>/dev/null || echo "Building first..."
cp -r distribution/scripts "$TEMP_DIR/app/"
cp package.json "$TEMP_DIR/app/"
cp next.config.ts "$TEMP_DIR/app/"
cp tsconfig.json "$TEMP_DIR/app/"

# Create main installer script
cat > "$TEMP_DIR/installer.sh" << 'EOF'
#!/bin/bash

echo "
╔══════════════════════════════════════════════════════════╗
║                    🤖 AI NAYAK 🤖                        ║
║             Complete Installation Package                 ║
║                                                          ║
║  This will install:                                      ║
║  • Node.js (if needed)                                   ║
║  • Ollama AI Engine                                      ║
║  • Llama 3.2 3B Model (~2GB)                            ║
║  • AI Nayak Application                                  ║
╚══════════════════════════════════════════════════════════╝
"

read -p "Continue with installation? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""
echo "🚀 Starting installation..."
echo ""

# Set installation directory
INSTALL_DIR="$HOME/AI-Nayak"

# Remove previous installation
if [ -d "$INSTALL_DIR" ]; then
    echo "Removing previous installation..."
    rm -rf "$INSTALL_DIR"
fi

echo "📁 Creating installation directory..."
mkdir -p "$INSTALL_DIR"

echo "📂 Extracting application files..."
cp -r app/* "$INSTALL_DIR/"

# Install Node.js if needed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        source ~/.bashrc
        nvm install --lts
    else
        # Linux
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    echo "✅ Node.js installed"
fi

# Install Ollama if needed
if ! command -v ollama &> /dev/null; then
    echo "🤖 Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
    echo "✅ Ollama installed"
fi

# Move to install directory and setup
cd "$INSTALL_DIR"

echo "📦 Installing dependencies..."
npm install --production

echo "🚀 Starting Ollama service..."
ollama serve &
sleep 5

echo "🧠 Downloading AI model..."
ollama pull llama3.2:3b

# Create start script
cat > "$INSTALL_DIR/start.sh" << 'STARTEOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🤖 Starting AI Nayak..."
ollama serve &
sleep 3
open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null || echo "Navigate to http://localhost:3000"
npm run start
STARTEOF

chmod +x "$INSTALL_DIR/start.sh"

# Create desktop shortcut (Linux)
if command -v xdg-user-dir &> /dev/null; then
    DESKTOP_DIR=$(xdg-user-dir DESKTOP)
    cat > "$DESKTOP_DIR/AI-Nayak.desktop" << DESKTOPEOF
[Desktop Entry]
Version=1.0
Type=Application
Name=AI Nayak
Comment=Personal AI Assistant
Exec=$INSTALL_DIR/start.sh
Icon=$INSTALL_DIR/public/favicon.ico
Terminal=false
Categories=Office;Development;
DESKTOPEOF
    chmod +x "$DESKTOP_DIR/AI-Nayak.desktop"
fi

echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "🎉 AI Nayak is now installed!"
echo "📍 Location: $INSTALL_DIR"
echo "🚀 Launch with: $INSTALL_DIR/start.sh"
echo "🌐 Or navigate to: http://localhost:3000"
echo ""

read -p "Launch AI Nayak now? (y/N): " launch
if [[ $launch =~ ^[Yy]$ ]]; then
    "$INSTALL_DIR/start.sh"
fi

echo ""
echo "Thank you for using AI Nayak! 🤖"
EOF

chmod +x "$TEMP_DIR/installer.sh"

# Create self-extracting archive
echo "📦 Creating self-extracting installer..."
cat > "$OUTPUT_DIR/AI-Nayak-Installer.sh" << 'EOF'
#!/bin/bash
# AI Nayak Self-Extracting Installer

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMP_EXTRACT="/tmp/ai-nayak-install-$$"

echo "🤖 AI Nayak - Self-Extracting Installer"
echo "Extracting files..."

# Find the line where the archive starts
ARCHIVE_LINE=$(awk '/^__ARCHIVE_BELOW__/ {print NR + 1; exit 0}' "$0")

# Extract the archive
mkdir -p "$TEMP_EXTRACT"
tail -n +$ARCHIVE_LINE "$0" | tar xz -C "$TEMP_EXTRACT"

# Run installer
cd "$TEMP_EXTRACT"
chmod +x installer.sh
./installer.sh

# Cleanup
cd /
rm -rf "$TEMP_EXTRACT"

exit 0

__ARCHIVE_BELOW__
EOF

# Append compressed archive
cd "$TEMP_DIR"
tar czf - . >> "$OUTPUT_DIR/AI-Nayak-Installer.sh"
chmod +x "$OUTPUT_DIR/AI-Nayak-Installer.sh"

# Create portable version
echo "📦 Creating portable version..."
cd "$TEMP_DIR/app"
tar czf "$OUTPUT_DIR/AI-Nayak-Portable.tar.gz" .

# Clean up
cd "$PROJECT_ROOT"
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 Installers created successfully!"
echo "================================="
echo "📁 Output location: $OUTPUT_DIR"
ls -lah "$OUTPUT_DIR" | tail -n +2 | while read line; do
    echo "  📦 $(echo $line | awk '{print $9 " (" $5 ")"}')"
done
echo ""
echo "Ready for distribution! 🚀"

#!/bin/bash

# Packaging script for AI Nayak
# Creates a ZIP file ready for distribution

set -e

echo "🤖 AI Nayak - Packager"
echo "======================"

# Create temporary distribution directory
DIST_DIR="ai-nayak-package"
ZIP_NAME="ai-nayak-v1.0.zip"

# Clean previous distribution
rm -rf $DIST_DIR
rm -f $ZIP_NAME

echo "📦 Creating package..."

# Create structure
mkdir -p $DIST_DIR

# Copy necessary files
echo "📁 Copying files..."

# Source code
cp -r src $DIST_DIR/
cp -r public $DIST_DIR/
cp package.json $DIST_DIR/
cp package-lock.json $DIST_DIR/
cp next.config.ts $DIST_DIR/
cp tsconfig.json $DIST_DIR/
cp postcss.config.mjs $DIST_DIR/
cp eslint.config.mjs $DIST_DIR/
cp next-env.d.ts $DIST_DIR/

# Installation scripts
cp -r distribution $DIST_DIR/

# README
cp distribution/README-DISTRIBUTION.md $DIST_DIR/README.md

# Create quick start guide
cat > $DIST_DIR/START.md << 'EOF'
# 🚀 QUICK START

## Windows
1. Run: `PowerShell -ExecutionPolicy Bypass -File distribution/scripts/install-windows.ps1`
2. Wait for the installation to finish
3. Done! The app will open automatically

## Linux/macOS
1. Run: `chmod +x distribution/scripts/install-unix.sh && ./distribution/scripts/install-unix.sh`
2. Wait for the installation to finish
3. Done! The app will open automatically

## If Node.js is already installed
1. Run: `node distribution/scripts/setup.js`
2. Then: `npm run start`
3. Visit: http://localhost:3000
EOF

# Create main install script
cat > $DIST_DIR/install.sh << 'EOF'
#!/bin/bash
echo "🤖 AI Nayak - Universal Installer"
echo "Detecting operating system..."

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "Windows detected. Running Windows installer..."
    powershell -ExecutionPolicy Bypass -File distribution/scripts/install-windows.ps1
else
    echo "Unix/Linux/macOS detected. Running Unix installer..."
    chmod +x distribution/scripts/install-unix.sh
    ./distribution/scripts/install-unix.sh
fi
EOF

chmod +x $DIST_DIR/install.sh

# Create Windows batch file
cat > $DIST_DIR/install.bat << 'EOF'
@echo off
echo 🤖 AI Nayak - Windows Installer
PowerShell -ExecutionPolicy Bypass -File distribution/scripts/install-windows.ps1
pause
EOF

echo "🗜️  Compressing..."

# Create ZIP
zip -r $ZIP_NAME $DIST_DIR

# Clean up
rm -rf $DIST_DIR

echo "✅ Package created: $ZIP_NAME"
echo ""
echo "📦 Package contents:"
echo "  - Full source code"
echo "  - Automatic installation scripts"
echo "  - Documentation"
echo "  - Installers for Windows, Linux, and macOS"
echo ""
echo "🚀 To distribute:"
echo "  1. Share the file $ZIP_NAME"
echo "  2. Users only need to:"
echo "     - Windows: run install.bat"
echo "     - Linux/macOS: run install.sh"
echo ""
echo "Ready to distribute! 🎉"

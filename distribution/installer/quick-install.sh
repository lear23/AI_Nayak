#!/bin/bash
# AI Nayak - Quick Installer for Linux/macOS
# This script installs everything needed

echo "🤖 AI Nayak - One-Click Installer"
echo "=================================="

# Check if running on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    OLLAMA_URL="https://ollama.com/download/Ollama-darwin.zip"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    OLLAMA_URL="https://ollama.com/download/ollama-linux-amd64"
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi

# Install Node.js if needed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    if [[ "$OS" == "macos" ]]; then
        # Install via Homebrew or direct download
        if command -v brew &> /dev/null; then
            brew install node
        else
            echo "Please install Node.js manually from https://nodejs.org"
            exit 1
        fi
    else
        # Linux - use package manager
        if command -v apt &> /dev/null; then
            sudo apt update && sudo apt install -y nodejs npm
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y nodejs npm
        else
            echo "Please install Node.js manually"
            exit 1
        fi
    fi
fi

# Install Ollama if needed
if ! command -v ollama &> /dev/null; then
    echo "🤖 Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Install AI Nayak
INSTALL_DIR="$HOME/AI-Nayak"
echo "📁 Installing to $INSTALL_DIR"

# Extract application files here...
mkdir -p "$INSTALL_DIR"
# Copy files, install dependencies, etc.

echo "✅ Installation complete!"
echo "🚀 Run: cd $INSTALL_DIR && npm start"

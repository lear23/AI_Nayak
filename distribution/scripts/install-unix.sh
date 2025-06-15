#!/bin/bash

# AI Nayak - Automatic Installer for Linux/macOS
# Run as: chmod +x install-unix.sh && ./install-unix.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}🤖 AI NAYAK - Automatic Installer${NC}"
    echo -e "${CYAN}===============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}🔍 $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_download() {
    echo -e "${YELLOW}⬇️  $1${NC}"
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    print_info "System detected: $OS"
}

# Check Node.js
check_node() {
    print_info "Checking Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_download "Installing Node.js..."
        if [[ "$OS" == "macos" ]]; then
            # Use Homebrew if available, otherwise download directly
            if command -v brew &> /dev/null; then
                brew install node
            else
                curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                nvm install --lts
                nvm use --lts
            fi
        else
            # Linux
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
        print_success "Node.js installed"
    fi
}

# Check npm
check_npm() {
    print_info "Checking npm..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm not found"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing project dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Check and install Ollama
setup_ollama() {
    print_info "Checking Ollama..."
    if command -v ollama &> /dev/null; then
        OLLAMA_VERSION=$(ollama --version)
        print_success "Ollama found: $OLLAMA_VERSION"
    else
        print_download "Downloading and installing Ollama..."
        curl -fsSL https://ollama.ai/install.sh | sh
        print_success "Ollama installed"
    fi
}

# Start Ollama service
start_ollama_service() {
    print_info "Starting Ollama service..."
    
    # Check if already running
    if curl -s http://localhost:11434 &> /dev/null; then
        print_success "Ollama service is already running"
    else
        # Start in background
        nohup ollama serve > /dev/null 2>&1 &
        sleep 5
        
        if curl -s http://localhost:11434 &> /dev/null; then
            print_success "Ollama service started"
        else
            print_error "Failed to start Ollama service"
            exit 1
        fi
    fi
}

# Check and download model
setup_model() {
    print_info "Checking for llama3.2:3b model..."
    
    if ollama list | grep -q "llama3.2:3b"; then
        print_success "Model already exists"
    else
        print_download "Downloading llama3.2:3b model (~2GB, may take some time)..."
        ollama pull llama3.2:3b
        print_success "Model downloaded"
    fi
}

# Build application
build_app() {
    print_info "Building application..."
    npm run build
    print_success "Application built"
}

# Main function
main() {
    print_header
    
    detect_os
    check_node
    check_npm
    install_dependencies
    setup_ollama
    start_ollama_service
    setup_model
    build_app
    
    echo ""
    print_success "🎉 INSTALLATION COMPLETED!"
    echo -e "${CYAN}===============================================${NC}"
    echo -e "${NC}🌐 To start AI Nayak:${NC}"
    echo -e "${YELLOW}   npm run start${NC}"
    echo ""
    echo -e "${NC}📍 The application will be available at:${NC}"
    echo -e "${YELLOW}   http://localhost:3000${NC}"
    echo ""
    echo -e "${NC}🤖 Ollama API running at:${NC}"
    echo -e "${YELLOW}   http://localhost:11434${NC}"
    echo -e "${CYAN}===============================================${NC}"
    
    # Ask if user wants to start now
    echo -n "Do you want to start AI Nayak now? (y/n): "
    read -r response
    if [[ "$response" =~ ^([sS][iI]|[sS]|[yY][eE][sS]|[yY])$ ]]; then
        print_info "🚀 Starting AI Nayak..."
        npm run start
    fi
}

# Check if running directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
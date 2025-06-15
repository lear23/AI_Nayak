# AI Nayak - Automatic Installer for Windows
# Run as: .\install-windows.ps1

Write-Host "🤖 AI Nayak - Automatic Installer" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check if running as administrator (optional for Ollama)
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "⚠️  Recommended: Run as Administrator for automatic installation" -ForegroundColor Yellow
}

# Check Node.js
Write-Host "🔍 Checking Node.js..." -ForegroundColor Green
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Installing..." -ForegroundColor Red
    # Download and install Node.js LTS
    $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    $nodeMsi = "$env:TEMP\nodejs.msi"
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeMsi
    Start-Process -Wait -FilePath "msiexec" -ArgumentList "/i `"$nodeMsi`" /quiet"
    Remove-Item $nodeMsi
    Write-Host "✅ Node.js installed" -ForegroundColor Green
}

# Check npm
Write-Host "🔍 Checking npm..." -ForegroundColor Green
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm error" -ForegroundColor Red
    exit 1
}

# Install project dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Green
npm install

# Check Ollama
Write-Host "🔍 Checking Ollama..." -ForegroundColor Green
try {
    $ollamaVersion = ollama --version
    Write-Host "✅ Ollama found: $ollamaVersion" -ForegroundColor Green
} catch {
    Write-Host "⬇️  Downloading Ollama..." -ForegroundColor Yellow
    $ollamaUrl = "https://ollama.ai/download/OllamaSetup.exe"
    $ollamaInstaller = "$env:TEMP\OllamaSetup.exe"
    
    # Show download progress
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile($ollamaUrl, $ollamaInstaller)
    
    Write-Host "🔧 Installing Ollama..." -ForegroundColor Yellow
    Start-Process -Wait -FilePath $ollamaInstaller -ArgumentList "/S"
    Remove-Item $ollamaInstaller
    
    # Update PATH for current session
    $env:PATH += ";$env:USERPROFILE\AppData\Local\Programs\Ollama"
    
    Write-Host "✅ Ollama installed" -ForegroundColor Green
}

# Start Ollama service in background
Write-Host "🚀 Starting Ollama service..." -ForegroundColor Green
Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden

# Wait for service to start
Start-Sleep -Seconds 5

# Check if model exists
Write-Host "🔍 Checking for llama3.2:3b model..." -ForegroundColor Green
$modelList = ollama list 2>$null
if ($modelList -match "llama3.2:3b") {
    Write-Host "✅ Model already exists" -ForegroundColor Green
} else {
    Write-Host "⬇️  Downloading llama3.2:3b model (~2GB, may take some time)..." -ForegroundColor Yellow
    ollama pull llama3.2:3b
    Write-Host "✅ Model downloaded" -ForegroundColor Green
}

# Build application
Write-Host "🏗️  Building application..." -ForegroundColor Green
npm run build

Write-Host ""
Write-Host "🎉 INSTALLATION COMPLETED!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🌐 To start AI Nayak:" -ForegroundColor White
Write-Host "   npm run start" -ForegroundColor Yellow
Write-Host ""
Write-Host "📍 The application will be available at:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "🤖 Ollama API running at:" -ForegroundColor White
Write-Host "   http://localhost:11434" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan

# Ask if user wants to start now
$startNow = Read-Host "Do you want to start AI Nayak now? (y/n)"
if ($startNow -eq "s" -or $startNow -eq "S" -or $startNow -eq "y" -or $startNow -eq "Y") {
    Write-Host "🚀 Starting AI Nayak..." -ForegroundColor Green
    npm run start
}
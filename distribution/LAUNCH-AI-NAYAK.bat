@echo off
title AI NAYAK - Launcher
color 0A

echo.
echo  ╔══════════════════════════════════════╗
echo  ║            🤖 AI NAYAK 🤖            ║
echo  ║     Private Local AI Assistant       ║
echo  ╚══════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found
    echo ⬇️  Installing Node.js...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile 'nodejs.msi'; Start-Process -Wait -FilePath 'msiexec' -ArgumentList '/i nodejs.msi /quiet'; Remove-Item 'nodejs.msi'}"
    echo ✅ Node.js installed
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Check Ollama
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ollama not found
    echo ⬇️  Downloading Ollama...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://ollama.ai/download/OllamaSetup.exe' -OutFile 'OllamaSetup.exe'; Start-Process -Wait -FilePath 'OllamaSetup.exe' -ArgumentList '/S'; Remove-Item 'OllamaSetup.exe'}"
    echo ✅ Ollama installed
    
    REM Add to PATH for this session
    set PATH=%PATH%;%USERPROFILE%\AppData\Local\Programs\Ollama
)

REM Start Ollama in background
echo 🚀 Starting Ollama...
start /B ollama serve

REM Wait a moment
timeout /t 5 /nobreak >nul

REM Check if model exists
ollama list | findstr "llama3.2:3b" >nul
if %errorlevel% neq 0 (
    echo ⬇️  Downloading AI model (~2GB)...
    echo     This may take several minutes...
    ollama pull llama3.2:3b
    echo ✅ Model downloaded
) else (
    echo ✅ Model already available
)

REM Build application if needed
if not exist ".next" (
    echo 🏗️  Building application...
    npm run build
)

echo.
echo 🎉 Everything ready! Starting AI Nayak...
echo 🌐 Will open at: http://localhost:3000
echo.

REM Start the application
start "" http://localhost:3000
npm run start

pause
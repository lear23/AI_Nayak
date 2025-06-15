# AI Nayak - Create Final Installer
# This script creates a self-contained installer

Write-Host "🤖 AI Nayak - Final Installer Creator" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Configuration
$PROJECT_ROOT = (Get-Location).Path
$INSTALLER_DIR = "distribution\installer"
$OUTPUT_DIR = "$INSTALLER_DIR\output"
$TEMP_DIR = "$INSTALLER_DIR\temp"

# Check if we're in the right directory
if (!(Test-Path "package.json") -or !(Test-Path "src")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "📁 Current directory: $PROJECT_ROOT" -ForegroundColor Yellow
    exit 1
}

# Clean previous builds
if (Test-Path $OUTPUT_DIR) {
    Remove-Item -Recurse -Force $OUTPUT_DIR
}
if (Test-Path $TEMP_DIR) {
    Remove-Item -Recurse -Force $TEMP_DIR
}

# Create directories
New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null
New-Item -ItemType Directory -Path $TEMP_DIR -Force | Out-Null

Write-Host "📦 Building application..." -ForegroundColor Green
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
} catch {
    Write-Host "❌ Build failed. Make sure dependencies are installed: npm install" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Creating installer package..." -ForegroundColor Yellow

# Create installer structure
$installerFiles = @(
    @{Source = "src"; Destination = "$TEMP_DIR\app\src"},
    @{Source = "public"; Destination = "$TEMP_DIR\app\public"},
    @{Source = ".next"; Destination = "$TEMP_DIR\app\.next"},
    @{Source = "distribution\scripts"; Destination = "$TEMP_DIR\app\scripts"},
    @{Source = "distribution\LAUNCH-AI-NAYAK.bat"; Destination = "$TEMP_DIR\app\LAUNCH-AI-NAYAK.bat"},
    @{Source = "package.json"; Destination = "$TEMP_DIR\app\package.json"},
    @{Source = "next.config.ts"; Destination = "$TEMP_DIR\app\next.config.ts"},
    @{Source = "tsconfig.json"; Destination = "$TEMP_DIR\app\tsconfig.json"}
)

foreach ($file in $installerFiles) {
    if (Test-Path $file.Source) {
        $destDir = Split-Path $file.Destination -Parent
        if (!(Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item -Recurse $file.Source $file.Destination -ErrorAction SilentlyContinue
    }
}

# Create main installer script
$mainInstallerContent = @"
@echo off
title AI Nayak Installer
color 0B

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                    🤖 AI NAYAK 🤖                        ║
echo  ║             Complete Installation Package                 ║
echo  ║                                                          ║
echo  ║  This will install:                                      ║
echo  ║  • Node.js (if needed)                                   ║
echo  ║  • Ollama AI Engine                                      ║
echo  ║  • Llama 3.2 3B Model (~2GB)                            ║
echo  ║  • AI Nayak Application                                  ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

set /p confirm="Continue with installation? (Y/N): "
if /i not "%confirm%"=="Y" goto :end

echo.
echo 🚀 Starting installation...
echo.

REM Extract files to program directory
set INSTALL_DIR=%USERPROFILE%\AI-Nayak
if exist "%INSTALL_DIR%" (
    echo Removing previous installation...
    rmdir /s /q "%INSTALL_DIR%"
)

echo 📁 Creating installation directory...
mkdir "%INSTALL_DIR%"

echo 📂 Extracting application files...
xcopy /E /I /Q app "%INSTALL_DIR%"

REM Install Node.js if needed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Node.js...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile 'nodejs.msi'; Start-Process -Wait -FilePath 'msiexec' -ArgumentList '/i nodejs.msi /quiet'; Remove-Item 'nodejs.msi'}"
    echo ✅ Node.js installed
)

REM Install Ollama if needed
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 🤖 Installing Ollama...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://ollama.ai/download/OllamaSetup.exe' -OutFile 'OllamaSetup.exe'; Start-Process -Wait -FilePath 'OllamaSetup.exe' -ArgumentList '/S'; Remove-Item 'OllamaSetup.exe'}"
    echo ✅ Ollama installed
)

REM Move to install directory and setup
cd /d "%INSTALL_DIR%"

echo 📦 Installing dependencies...
npm install --production

echo 🚀 Starting Ollama service...
start /B ollama serve
timeout /t 5 /nobreak >nul

echo 🧠 Downloading AI model...
ollama pull llama3.2:3b

REM Create desktop shortcut
echo 🔗 Creating shortcuts...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\AI Nayak.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\start.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Save()"

REM Create start menu shortcut
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath('StartMenu') + '\AI Nayak.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\start.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Save()"

REM Create start script
echo @echo off > "%INSTALL_DIR%\start.bat"
echo title AI Nayak >> "%INSTALL_DIR%\start.bat"
echo cd /d "%INSTALL_DIR%" >> "%INSTALL_DIR%\start.bat"
echo start /B ollama serve >> "%INSTALL_DIR%\start.bat"
echo timeout /t 3 /nobreak ^>nul >> "%INSTALL_DIR%\start.bat"
echo start "" http://localhost:3000 >> "%INSTALL_DIR%\start.bat"
echo npm run start >> "%INSTALL_DIR%\start.bat"

REM Create uninstaller
echo @echo off > "%INSTALL_DIR%\uninstall.bat"
echo title Uninstall AI Nayak >> "%INSTALL_DIR%\uninstall.bat"
echo echo Removing AI Nayak... >> "%INSTALL_DIR%\uninstall.bat"
echo taskkill /f /im node.exe 2^>nul >> "%INSTALL_DIR%\uninstall.bat"
echo taskkill /f /im ollama.exe 2^>nul >> "%INSTALL_DIR%\uninstall.bat"
echo timeout /t 2 /nobreak ^>nul >> "%INSTALL_DIR%\uninstall.bat"
echo cd /d "%%USERPROFILE%%" >> "%INSTALL_DIR%\uninstall.bat"
echo rmdir /s /q "%INSTALL_DIR%" >> "%INSTALL_DIR%\uninstall.bat"
echo del "%%USERPROFILE%%\Desktop\AI Nayak.lnk" 2^>nul >> "%INSTALL_DIR%\uninstall.bat"
echo echo AI Nayak uninstalled successfully! >> "%INSTALL_DIR%\uninstall.bat"
echo pause >> "%INSTALL_DIR%\uninstall.bat"

echo.
echo ✅ Installation completed successfully!
echo.
echo 🎉 AI Nayak is now installed!
echo 📍 Location: %INSTALL_DIR%
echo 🚀 Launch from Desktop shortcut or Start Menu
echo 🌐 Or navigate to: http://localhost:3000
echo.

set /p launch="Launch AI Nayak now? (Y/N): "
if /i "%launch%"=="Y" start "" "%INSTALL_DIR%\start.bat"

:end
echo.
echo Thank you for using AI Nayak! 🤖
pause
"@

Set-Content -Path "$TEMP_DIR\installer.bat" -Value $mainInstallerContent -Encoding UTF8

# Create self-extracting executable using 7zip if available, otherwise create ZIP
$sevenZip = Get-Command "7z" -ErrorAction SilentlyContinue
if ($sevenZip) {
    Write-Host "📦 Creating self-extracting executable..." -ForegroundColor Green
    & 7z a -sfx "$OUTPUT_DIR\AI-Nayak-Installer.exe" "$TEMP_DIR\*"
} else {
    Write-Host "📦 Creating ZIP installer..." -ForegroundColor Yellow
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($TEMP_DIR, "$OUTPUT_DIR\AI-Nayak-Installer.zip")
}

# Create portable version
Write-Host "📦 Creating portable version..." -ForegroundColor Green
$portableContent = @"
@echo off
title AI Nayak Portable
echo 🤖 AI Nayak - Portable Version
echo Starting services...

REM Check requirements
where node >nul 2>&1 || (echo ❌ Node.js required & pause & exit)
where ollama >nul 2>&1 || (echo ❌ Ollama required & pause & exit)

REM Start Ollama
start /B ollama serve
timeout /t 3 /nobreak >nul

REM Check model
ollama list | findstr "llama3.2:3b" >nul || (
    echo 🧠 Downloading model...
    ollama pull llama3.2:3b
)

REM Start app
start "" http://localhost:3000
npm run start
"@

Set-Content -Path "$TEMP_DIR\app\portable.bat" -Value $portableContent
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory("$TEMP_DIR\app", "$OUTPUT_DIR\AI-Nayak-Portable.zip")

# Clean up
Remove-Item -Recurse -Force $TEMP_DIR

Write-Host ""
Write-Host "🎉 Installers created successfully!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "📁 Output location: $OUTPUT_DIR" -ForegroundColor White
Get-ChildItem $OUTPUT_DIR | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  📦 $($_.Name) ($size MB)" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Ready for distribution! 🚀" -ForegroundColor Green

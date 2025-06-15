# AI Nayak - Packaging Script (Windows PowerShell)
# Creates a ready-to-distribute ZIP file

Write-Host "🤖 AI Nayak - Packager" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

# Configuration
$DIST_DIR = "ai-nayak-package"
$ZIP_NAME = "ai-nayak-v1.0.zip"

# Clean previous distribution
if (Test-Path $DIST_DIR) {
    Remove-Item -Recurse -Force $DIST_DIR
}
if (Test-Path $ZIP_NAME) {
    Remove-Item $ZIP_NAME
}

Write-Host "📦 Creating package..." -ForegroundColor Green

# Create directory structure
New-Item -ItemType Directory -Path $DIST_DIR | Out-Null

Write-Host "📁 Copying files..." -ForegroundColor Yellow

# Copy required files
$filesToCopy = @(
    @{Source = "src"; Destination = "$DIST_DIR\src"},
    @{Source = "public"; Destination = "$DIST_DIR\public"},
    @{Source = "distribution"; Destination = "$DIST_DIR\distribution"},
    @{Source = "package.json"; Destination = "$DIST_DIR\package.json"},
    @{Source = "package-lock.json"; Destination = "$DIST_DIR\package-lock.json"},
    @{Source = "next.config.ts"; Destination = "$DIST_DIR\next.config.ts"},
    @{Source = "tsconfig.json"; Destination = "$DIST_DIR\tsconfig.json"},
    @{Source = "postcss.config.mjs"; Destination = "$DIST_DIR\postcss.config.mjs"},
    @{Source = "eslint.config.mjs"; Destination = "$DIST_DIR\eslint.config.mjs"},
    @{Source = "next-env.d.ts"; Destination = "$DIST_DIR\next-env.d.ts"}
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file.Source) {
        if (Test-Path $file.Source -PathType Container) {
            Copy-Item -Recurse $file.Source $file.Destination
        } else {
            Copy-Item $file.Source $file.Destination
        }
    }
}

# Copy distribution README as main README
Copy-Item "distribution\README-DISTRIBUTION.md" "$DIST_DIR\README.md"

# Create quick start file
$startContent = @"
# 🚀 QUICK START

## Windows
1. Run: ``PowerShell -ExecutionPolicy Bypass -File distribution/scripts/install-windows.ps1``
2. Wait for installation to complete
3. Done! The app will open automatically

## Linux/macOS
1. Run: ``chmod +x distribution/scripts/install-unix.sh && ./distribution/scripts/install-unix.sh``
2. Wait for installation to complete
3. Done! The app will open automatically

## With Node.js already installed
1. Run: ``node distribution/scripts/setup.js``
2. Then: ``npm run start``
3. Navigate to: http://localhost:3000
"@

Set-Content -Path "$DIST_DIR\START.md" -Value $startContent

# Create universal installer for Unix
$installShContent = @"
#!/bin/bash
echo "🤖 AI Nayak - Universal Installer"
echo "Detecting operating system..."

if [[ "`$OSTYPE" == "msys" || "`$OSTYPE" == "win32" ]]; then
    echo "Windows detected. Running Windows installer..."
    powershell -ExecutionPolicy Bypass -File distribution/scripts/install-windows.ps1
else
    echo "Unix/Linux/macOS detected. Running Unix installer..."
    chmod +x distribution/scripts/install-unix.sh
    ./distribution/scripts/install-unix.sh
fi
"@

Set-Content -Path "$DIST_DIR\install.sh" -Value $installShContent

# Create Windows batch file
$installBatContent = @"
@echo off
echo 🤖 AI Nayak - Windows Installer
PowerShell -ExecutionPolicy Bypass -File distribution/scripts/install-windows.ps1
pause
"@

Set-Content -Path "$DIST_DIR\install.bat" -Value $installBatContent

Write-Host "🗜️  Compressing..." -ForegroundColor Yellow

# Create ZIP using .NET
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($DIST_DIR, $ZIP_NAME)

# Clean up
Remove-Item -Recurse -Force $DIST_DIR

Write-Host "✅ Package created: $ZIP_NAME" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Package contents:" -ForegroundColor White
Write-Host "  - Complete source code" -ForegroundColor Gray
Write-Host "  - Automatic installation scripts" -ForegroundColor Gray
Write-Host "  - Documentation" -ForegroundColor Gray
Write-Host "  - Installers for Windows, Linux and macOS" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 For distribution:" -ForegroundColor White
Write-Host "  1. Share the $ZIP_NAME file" -ForegroundColor Yellow
Write-Host "  2. Users only need to:" -ForegroundColor White
Write-Host "     - Windows: run install.bat" -ForegroundColor Gray
Write-Host "     - Linux/macOS: run install.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "Ready for distribution! 🎉" -ForegroundColor Green
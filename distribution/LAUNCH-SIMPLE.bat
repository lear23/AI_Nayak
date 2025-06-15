@echo off
echo Starting AI NAYAK...

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start Ollama in background
echo Starting Ollama...
start /B ollama serve >nul 2>&1

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Check if model exists
ollama list | findstr "llama3.2:3b" >nul
if %errorlevel% neq 0 (
    echo Downloading AI model...
    ollama pull llama3.2:3b
)

REM Go back to main directory and start
cd ..
echo Starting application...
start "" http://localhost:3000
npm run dev

pause
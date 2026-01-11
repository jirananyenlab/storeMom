@echo off
cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call bun install
)

:: Check if port 3000 is already in use
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel%==0 (
    echo Server is already running. Opening browser...
    start "" "http://localhost:3000"
    exit /b 0
)

:: Check if .next folder exists (already built)
if not exist ".next" (
    echo Building StoreMom for production...
    call bun run build
)

:: Start the Next.js production server
echo Starting StoreMom...
start /b bun run start

:: Wait for server to be ready (check every 1 second, max 30 seconds)
set /a count=0
:waitloop
timeout /t 1 /nobreak >nul
set /a count+=1

:: Check if server is responding
curl -s -o nul -w "" http://localhost:3000 >nul 2>&1
if %errorlevel%==0 (
    echo Server is ready!
    start "" "http://localhost:3000"
    exit /b 0
)

if %count% lss 30 goto waitloop

echo Timeout waiting for server. Please check the logs.
pause

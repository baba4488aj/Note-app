@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Lumenwild needs Node.js 20 or newer installed once.
  echo Download the LTS version from https://nodejs.org and run this launcher again.
  pause
  exit /b 1
)
node "%~dp0server.cjs"
if errorlevel 1 pause
endlocal

@echo off
setlocal
cd /d "%~dp0"
title HAIKYUU LEGENDS - Local Developer Build
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install Node.js 20 or newer from https://nodejs.org/
  echo Then reopen this file.
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js with npm included.
  pause
  exit /b 1
)
echo.
echo =============================================
echo  HAIKYUU LEGENDS V26.2 - LOCAL DEV BUILD
 echo =============================================
echo.
echo This runs on YOUR COMPUTER only.
echo It does not push code or redeploy Render.
echo.
if not exist "node_modules\ws\package.json" (
  echo First launch: installing game dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection.
    pause
    exit /b 1
  )
)
echo.
echo Open in your browser: http://localhost:3000
echo 3D preview: http://localhost:3000/v26-showcase.html
echo To stop the local server, press Ctrl+C.
echo.
call npm start
pause

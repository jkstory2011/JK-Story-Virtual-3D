@echo off
setlocal
cd /d "%~dp0"
title JK Story Virtual 3D - Auto Start

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\is-preview-running.ps1" >nul 2>nul
if not errorlevel 1 exit /b 0

if not exist ".runtime\deskrpg\node_modules" (
  echo [JKSTORY] First installation is required. Use the desktop shortcut once.
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 exit /b 1

cd /d ".runtime\deskrpg"
if not exist ".env.local" (
  echo [JKSTORY] Local setup is required. Use the desktop shortcut once.
  exit /b 1
)
echo [JKSTORY] Starting the installed office at http://127.0.0.1:3000/jkstory-preview
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\open-preview.ps1"
node --import tsx dev-server.ts
exit /b %errorlevel%

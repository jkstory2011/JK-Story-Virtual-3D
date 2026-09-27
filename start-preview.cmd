@echo off
setlocal
cd /d "%~dp0"
title JK Story Virtual 3D - Preview

where node >nul 2>nul
if errorlevel 1 goto missing_node
where git >nul 2>nul
if errorlevel 1 goto missing_git

echo [JKSTORY] Getting the latest project files...
git pull --ff-only
if errorlevel 1 goto failed

if not exist ".runtime\deskrpg\node_modules" (
  echo [JKSTORY] Installing the 3D office. The first run may take several minutes.
  call scripts\bootstrap.cmd
  if errorlevel 1 goto failed
) else (
  xcopy "overlay\*" ".runtime\deskrpg\" /E /I /Y >nul
  if errorlevel 1 goto failed
)

cd /d ".runtime\deskrpg"
if not exist ".env.local" (
  echo [JKSTORY] Setting up the local trial database...
  call npm run setup:lite
  if errorlevel 1 goto failed
)

echo [JKSTORY] Starting the office at http://localhost:3000/jkstory-preview
echo [JKSTORY] The browser will open when the server is ready. Keep this window open.
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\open-preview.ps1"
node --import tsx dev-server.ts
if errorlevel 1 goto failed
exit /b 0

:missing_node
echo Node.js is required: https://nodejs.org/en/download
goto failed
:missing_git
echo Git for Windows is required: https://git-scm.com/install/windows
goto failed
:failed
echo.
echo Could not start the office. Send a screenshot of this window for diagnosis.
pause
exit /b 1

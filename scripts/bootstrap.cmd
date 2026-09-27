@echo off
setlocal
for %%I in ("%~dp0..") do set "PROJECT_DIR=%%~fI"
set "RUNTIME_DIR=%PROJECT_DIR%\.runtime\deskrpg"
set "UPSTREAM_COMMIT=911069eac66267624c49c46e1f8efe7a49cf018a"

where git >nul 2>nul
if errorlevel 1 (
  echo Git is required. Install it from https://git-scm.com/install/windows
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js and npm are required. Install the LTS release from https://nodejs.org/en/download
  exit /b 1
)

if not exist "%PROJECT_DIR%\.runtime" mkdir "%PROJECT_DIR%\.runtime"
if not exist "%RUNTIME_DIR%\.git" (
  git clone --filter=blob:none https://github.com/dandacompany/deskrpg.git "%RUNTIME_DIR%"
  if errorlevel 1 exit /b 1
)
git -C "%RUNTIME_DIR%" fetch origin %UPSTREAM_COMMIT%
if errorlevel 1 exit /b 1
git -C "%RUNTIME_DIR%" checkout --detach %UPSTREAM_COMMIT%
if errorlevel 1 exit /b 1
xcopy "%PROJECT_DIR%\overlay\*" "%RUNTIME_DIR%\" /E /I /Y >nul
if errorlevel 1 exit /b 1
cd /d "%RUNTIME_DIR%"
call npm ci
if errorlevel 1 exit /b 1
echo DeskRPG %UPSTREAM_COMMIT% and JKSTORY preview are ready.
exit /b 0

param([string]$ProjectDir)

$ErrorActionPreference = 'Stop'
# The launcher can be replaced by git pull while a batch file is running.
# Derive the repository path from this script if its argument was lost.
if ([string]::IsNullOrWhiteSpace($ProjectDir)) {
  $ProjectDir = Split-Path -Parent $PSScriptRoot
}
$ProjectDir = [System.IO.Path]::GetFullPath($ProjectDir)
$launcher = Join-Path $ProjectDir 'start-preview.cmd'
if (-not (Test-Path -LiteralPath $launcher)) { throw "Launcher not found: $launcher" }

$shell = New-Object -ComObject WScript.Shell
$locations = @(
  [Environment]::GetFolderPath('DesktopDirectory'),
  (Join-Path ([Environment]::GetFolderPath('Programs')) 'JK Story Virtual 3D')
)
foreach ($location in $locations) {
  if (-not (Test-Path -LiteralPath $location)) {
    New-Item -ItemType Directory -Path $location -Force | Out-Null
  }
  $linkPath = Join-Path $location 'JK Story Virtual 3D.lnk'
  $shortcut = $shell.CreateShortcut($linkPath)
  $shortcut.TargetPath = $launcher
  $shortcut.WorkingDirectory = $ProjectDir
  $shortcut.Description = 'JKSTORY 3D 사무실 실행 및 최신 버전 확인'
  $shortcut.Save()
}
# Start the local preview automatically for this Windows user after sign-in.
$startup = [Environment]::GetFolderPath('Startup')
if ([string]::IsNullOrWhiteSpace($startup)) { throw 'Windows Startup folder is unavailable.' }
if (-not (Test-Path -LiteralPath $startup)) { New-Item -ItemType Directory -Path $startup -Force | Out-Null }
$startupLink = $shell.CreateShortcut((Join-Path $startup 'JK Story Virtual 3D.lnk'))
$localLauncher = Join-Path $ProjectDir 'start-local.cmd'
if (-not (Test-Path -LiteralPath $localLauncher)) { throw "Auto-start launcher not found: $localLauncher" }
$startupLink.TargetPath = $localLauncher
$startupLink.WorkingDirectory = $ProjectDir
$startupLink.WindowStyle = 7
$startupLink.Description = 'JKSTORY 3D 사무실 자동 시작'
$startupLink.Save()
Write-Host '[JKSTORY] Desktop, Start menu, and Windows sign-in startup shortcuts are ready.'

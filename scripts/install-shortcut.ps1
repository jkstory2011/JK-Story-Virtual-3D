param([string]$ProjectDir)

$ErrorActionPreference = 'Stop'
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
Write-Host '[JKSTORY] Desktop and Start menu shortcuts are ready.'

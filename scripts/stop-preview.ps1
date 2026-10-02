$ErrorActionPreference = 'Stop'

try {
  $listeners = @(Get-NetTCPConnection -LocalPort 3000 -State Listen |
    Select-Object -ExpandProperty OwningProcess -Unique)
  if ($listeners.Count -eq 0) { throw 'No process is listening on port 3000.' }
  foreach ($ownerId in $listeners) {
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $ownerId"
    if (-not $processInfo -or $processInfo.CommandLine -notmatch 'dev-server\.ts') {
      throw "Port 3000 is owned by an unexpected process ($ownerId)."
    }
  }
  foreach ($ownerId in $listeners) {
    Stop-Process -Id $ownerId -Force
  }
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 500
    if (-not (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)) {
      Write-Host '[JKSTORY] Previous office stopped. Starting the updated office.'
      exit 0
    }
  }
  throw 'The old office did not release port 3000 within 10 seconds.'
} catch {
  Write-Host "[JKSTORY] Could not restart the office: $($_.Exception.Message)"
  exit 1
}

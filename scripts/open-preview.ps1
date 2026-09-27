$url = 'http://127.0.0.1:3000/jkstory-preview'
for ($attempt = 0; $attempt -lt 90; $attempt++) {
  Start-Sleep -Seconds 2
  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 4
    if ($response.StatusCode -eq 200 -and $response.Content -match 'JK Story Virtual 3D') {
      Start-Process $url
      exit 0
    }
  } catch {
    # The local Next.js server may still be starting.
  }
}
Write-Host 'The office did not become ready within three minutes. Check the server window.'

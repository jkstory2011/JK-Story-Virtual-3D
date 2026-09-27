try {
  $response = Invoke-WebRequest -Uri 'http://127.0.0.1:3000/jkstory-preview' -UseBasicParsing -TimeoutSec 3
  if ($response.StatusCode -eq 200 -and $response.Content -match 'JK Story Virtual 3D') { exit 0 }
} catch {
  # A running process is not yet serving the JKSTORY page.
}
exit 1

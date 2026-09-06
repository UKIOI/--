param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$gameRoot = Split-Path -Parent $PSScriptRoot
$python = Join-Path $gameRoot 'backend\.venv\Scripts\python.exe'
if (!(Test-Path -LiteralPath $python)) { throw 'Run backend setup first: Python environment is missing.' }
$version = (Get-Content -LiteralPath (Join-Path $gameRoot 'content\changelog.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version
if (!(Test-Path -LiteralPath (Join-Path $gameRoot 'frontend\dist\index.html'))) { throw 'Game webpage is missing. Run npm ci and npm run build in frontend first.' }
Write-Host "WARWALL $version LAN / Keep this window open." -ForegroundColor Green
Write-Host 'Open on this PC: http://127.0.0.1:8000'
try {
    Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.254.*' } | ForEach-Object { Write-Host ('Invite LAN friends: http://' + $_.IPAddress + ':8000') -ForegroundColor Cyan }
} catch {
    Write-Warning 'Cannot list LAN addresses. Local play is still available; use ipconfig to find your LAN IPv4 address.'
}
Set-Location -LiteralPath (Join-Path $gameRoot 'backend')
try {
    $existing = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/lan/status' -TimeoutSec 2
    if ($existing.capacity -eq 4 -and $existing.version) {
        $page = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 3
        if ($page.StatusCode -ne 200) { throw 'Existing service cannot serve the webpage.' }
        Write-Host 'LAN service is already running. Keep its original window open.' -ForegroundColor Green
        if (!$NoBrowser) { Start-Process 'http://127.0.0.1:8000' }
        exit 0
    }
} catch { }
$logDir = Join-Path $gameRoot 'data'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$errorLog = Join-Path $logDir "lan-$PID-error.log"
$outputLog = Join-Path $logDir "lan-$PID-output.log"
$server = $null
try {
    $server = Start-Process -FilePath $python -ArgumentList '-m','uvicorn','app.main:app','--host','0.0.0.0','--port','8000' -WorkingDirectory (Join-Path $gameRoot 'backend') -WindowStyle Hidden -RedirectStandardOutput $outputLog -RedirectStandardError $errorLog -PassThru
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 500
        if ($server.HasExited) { break }
        try {
            $status = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/lan/status' -TimeoutSec 1
            $page = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 1
            if ($status.capacity -eq 4 -and $page.StatusCode -eq 200) { $ready = $true; break }
        } catch { }
    }
    if (!$ready -or $server.HasExited) {
        Get-Content -LiteralPath $errorLog -ErrorAction SilentlyContinue | Write-Host
        throw "Web service failed to start. Check port 8000 and log: $errorLog"
    }
    Write-Host 'Webpage is ready: http://127.0.0.1:8000' -ForegroundColor Green
    if (!$NoBrowser) {
        try { Start-Process 'http://127.0.0.1:8000' }
        catch { Write-Warning 'Open http://127.0.0.1:8000 manually in your browser.' }
    }
    Write-Host "Press Ctrl+C to stop. Service log: $errorLog"
    Wait-Process -Id $server.Id
} finally {
    if ($server -and !$server.HasExited) { Stop-Process -Id $server.Id -ErrorAction SilentlyContinue }
}

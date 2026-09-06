$ErrorActionPreference = 'Stop'
$gameRoot = Split-Path -Parent $PSScriptRoot
$python = Join-Path $gameRoot 'backend\.venv\Scripts\python.exe'
if (!(Test-Path -LiteralPath $python)) { throw 'Run backend setup first: Python environment is missing.' }
Write-Host 'WARWALL 1.0.0 LAN / Keep this window open.' -ForegroundColor Green
Write-Host 'Open on this PC: http://127.0.0.1:8000'
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.254.*' } | ForEach-Object { Write-Host ('Invite LAN friends: http://' + $_.IPAddress + ':8000') -ForegroundColor Cyan }
Set-Location -LiteralPath (Join-Path $gameRoot 'backend')
try {
    $existing = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/lan/status' -TimeoutSec 2
    if ($existing.version -eq '1.0.0') {
        Write-Host 'LAN service is already running. Keep its original window open.' -ForegroundColor Green
        Start-Process 'http://127.0.0.1:8000'
        exit 0
    }
} catch { }
& $python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

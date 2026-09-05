$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$pythonPath = Join-Path $projectRoot 'backend\.venv\Scripts\python.exe'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path -LiteralPath $pythonPath)) { throw '请先按照 README 创建 backend/.venv 并安装依赖。' }
if (-not (Test-Path -LiteralPath $nodePath)) { throw '请安装 Node.js 22.12 或更新版本。' }
if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'frontend\dist\index.html'))) { throw '请先在 frontend 运行 npm ci 和 npm run build。' }
$processes = @()
try {
    $processes += Start-Process -FilePath $pythonPath -ArgumentList '-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8000' -WorkingDirectory (Join-Path $projectRoot 'backend') -WindowStyle Hidden -PassThru
    $processes += Start-Process -FilePath $nodePath -ArgumentList 'node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173','--strictPort' -WorkingDirectory (Join-Path $projectRoot 'frontend') -WindowStyle Hidden -PassThru
    Write-Host '战墙已启动。浏览器访问 http://127.0.0.1:4173'
    Read-Host '按 Enter 停止本次启动的两个服务'
} finally {
    foreach ($process in $processes) { if (-not $process.HasExited) { Stop-Process -Id $process.Id -ErrorAction SilentlyContinue } }
}

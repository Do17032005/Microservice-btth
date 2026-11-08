# Script khởi chạy nhanh Giao diện Web UI (SRS-RHL-002)
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  KHOI DONG GIAO DIEN WEB UI - RHL PLATFORM (SRS-RHL-002)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

$baseDir = $PSScriptRoot
if (-not $baseDir) { $baseDir = Get-Location }
$uiPath = Join-Path $baseDir "web-ui"
if (-not (Test-Path $uiPath)) {
    $uiPath = Join-Path (Get-Location) "web-ui"
}

if (Test-Path $uiPath) {
    Set-Location $uiPath
    Start-Process "http://localhost:3000"
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        Write-Host "[1] Dang khoi chay local server tai cong 3000..." -ForegroundColor Yellow
        npx serve -l 3000 .
    } else {
        Write-Host "[2] Khong tim thay npx, dang mo truc tiep file index.html..." -ForegroundColor Yellow
        Start-Process (Join-Path $uiPath "index.html")
    }
} else {
    Write-Host "[!] Khong tim thay thu muc web-ui tai $uiPath" -ForegroundColor Red
}

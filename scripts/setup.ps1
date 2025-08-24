# Outfitter Monorepo Setup Script for Windows
# PowerShell fallback that attempts to use Git Bash or WSL

param(
    [string[]]$Arguments = @()
)

Write-Host "🚀 Outfitter Monorepo Setup (Windows)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check for Git Bash
$gitBashPath = Get-Command "bash.exe" -ErrorAction SilentlyContinue
if ($gitBashPath) {
    Write-Host "✓ Found Git Bash, running setup script..." -ForegroundColor Green
    # Determine the repo root (Windows absolute path)
    $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
    # Convert Windows path -> MSYS/Unix path (/c/…); capture cygpath output
    $repoUnix = & bash.exe -lc "cygpath -u `"$repoRoot`""
    # Quote each argument for Bash and join into a single string
    $argsString = ($Arguments | ForEach-Object { "'$_'" }) -join ' '
    # Run setup.sh inside the repo directory with quoted args
    & bash.exe -lc "cd '$repoUnix' && ./setup.sh $argsString"
    exit $LASTEXITCODE
}

# Check for WSL
$wslPath = Get-Command "wsl.exe" -ErrorAction SilentlyContinue
if ($wslPath) {
    Write-Host "✓ Found WSL, running setup script..." -ForegroundColor Green
    $repoRoot   = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
    $repoLinux  = & wsl.exe wslpath -a "$repoRoot"
    $argsString = ($Arguments | ForEach-Object { "'$_'" }) -join ' '
    & wsl.exe bash -lc "cd '$repoLinux' && ./setup.sh $argsString"
    exit $LASTEXITCODE
}

# Fallback: provide guidance
Write-Host "❌ Neither Git Bash nor WSL found." -ForegroundColor Red
Write-Host ""
Write-Host "To run the setup script on Windows, you need either:" -ForegroundColor Yellow
Write-Host "1. Git for Windows (includes Git Bash): https://git-scm.com/download/win" -ForegroundColor Yellow
Write-Host "2. Windows Subsystem for Linux (WSL): https://docs.microsoft.com/en-us/windows/wsl/install" -ForegroundColor Yellow
Write-Host ""
Write-Host "After installing one of these, run:" -ForegroundColor Cyan
Write-Host "  bun run setup" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or manually run:" -ForegroundColor Cyan
Write-Host "  bun install" -ForegroundColor Cyan
Write-Host "  bun run build" -ForegroundColor Cyan

exit 1
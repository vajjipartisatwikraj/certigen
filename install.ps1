# CertiGen Installation Script
# Run this script from the certigen root directory

Write-Host "🚀 CertiGen Installation Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    if ($mongoService) {
        Write-Host "✅ MongoDB service found" -ForegroundColor Green
        if ($mongoService.Status -eq 'Running') {
            Write-Host "✅ MongoDB is running" -ForegroundColor Green
        } else {
            Write-Host "⚠️  MongoDB service exists but not running" -ForegroundColor Yellow
            Write-Host "Starting MongoDB..." -ForegroundColor Yellow
            Start-Service MongoDB
            Write-Host "✅ MongoDB started" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  MongoDB service not found. Make sure MongoDB is installed and running." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check MongoDB service status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Open TWO PowerShell terminals:" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see README.md or QUICKSTART.md" -ForegroundColor Cyan

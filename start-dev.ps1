# Christmas Lights App - Development Server Startup Script
# This script properly sets up the PATH and starts the dev server

Write-Host "🔧 Starting Christmas Lights App..." -ForegroundColor Yellow

# Set up PATH to include Node.js
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

Write-Host "✅ Node.js version:" -ForegroundColor Green
node --version

Write-Host "✅ npm version:" -ForegroundColor Green
npm --version

Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
Write-Host "📱 Open http://localhost:3000 in your browser" -ForegroundColor Magenta
Write-Host "⏹️  Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

npm run dev

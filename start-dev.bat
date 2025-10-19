@echo off
echo 🔧 Starting Christmas Lights App...
echo.

REM Set up PATH to include Node.js
set PATH=C:\Program Files\nodejs;%PATH%

echo ✅ Node.js version:
node --version
echo.
echo ✅ npm version:
npm --version
echo.
echo 🚀 Starting development server...
echo 📱 Open http://localhost:3000 in your browser
echo ⏹️  Press Ctrl+C to stop the server
echo.
npm run dev
pause

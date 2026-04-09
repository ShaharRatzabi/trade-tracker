@echo off
echo ============================================================
echo   Trade Tracker - Starting up...
echo ============================================================
echo.

echo [1/2] Starting backend (port 3001)...
start "Trade Tracker - Backend" cmd /k "cd /d "%~dp0server" && npm install && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting frontend (port 3000)...
start "Trade Tracker - Frontend" cmd /k "cd /d "%~dp0client" && npm install && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo ============================================================
echo   Open http://localhost:3000 in your browser
echo ============================================================
echo.
echo Two terminal windows have opened (backend + frontend).
echo Close them to stop the app.
echo.
pause

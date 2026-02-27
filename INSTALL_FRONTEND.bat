@echo off
echo ========================================
echo Installing Frontend Dependencies
echo ========================================
echo.

cd frontend

echo Step 1: Installing all dependencies...
call npm install

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To start the development server:
echo   cd frontend
echo   npm run dev
echo.
echo Frontend will run on: http://localhost:5173
echo Backend should run on: http://localhost:5000
echo.
pause

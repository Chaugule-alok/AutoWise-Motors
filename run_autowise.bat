@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
    set PY=py
) else (
    set PY=python
)

echo ==========================================
echo        AutoWise - Database Server
echo ==========================================
echo.
echo Installing/checking Python packages...
%PY% -m pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo Could not install dependencies. Check your Python/pip installation.
    pause
    exit /b 1
)

echo.
echo Starting AutoWise at http://127.0.0.1:8000
echo Keep this window open while using the website.
echo.
%PY% server.py
pause

@echo off
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Creating Python environment...
  py -m venv .venv
  if errorlevel 1 goto failed
)
".venv\Scripts\python.exe" -c "import flask" >nul 2>&1
if errorlevel 1 (
  echo Installing Flask. Internet is needed for this first setup.
  ".venv\Scripts\python.exe" -m pip install -r requirements.txt
  if errorlevel 1 goto failed
)
echo Open http://127.0.0.1:5000 in your browser. Keep this window open.
".venv\Scripts\python.exe" app.py
pause
exit /b
:failed
echo Setup failed. Read the error above and see README.md for manual commands.
pause
exit /b 1

@echo off
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Run start_windows.bat once to complete setup, then retry this check.
  pause
  exit /b 1
)
".venv\Scripts\python.exe" self_check.py
set "check_result=%errorlevel%"
if not "%check_result%"=="0" echo CHECK FAILED. Copy the error above to the integration owner.
pause
exit /b %check_result%

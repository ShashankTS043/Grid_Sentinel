@echo off
echo Starting Grid-Sentinel Backend...

call venv\Scripts\activate

uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause

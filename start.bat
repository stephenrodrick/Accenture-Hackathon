@echo off
echo Starting Farming Advisor Application...

:: Create required directories if they don't exist
if not exist "frontend" mkdir frontend
if not exist "frontend\css" mkdir frontend\css
if not exist "frontend\js" mkdir frontend\js

:: Start backend server
cd backend
start server.py

:: Wait for server to start
timeout /t 3

:: Open in default browser
start http://localhost:5000

echo Application started successfully!
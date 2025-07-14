# Run AutoTestGenie Application

# Start the backend server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ./backend; if (Test-Path venv/Scripts/Activate.ps1) { ./venv/Scripts/Activate.ps1 } else { python -m venv venv; ./venv/Scripts/Activate.ps1; pip install -r requirements.txt }; python run.py"

# Start the frontend server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ./frontend; npm install; npm start"

# Open the application in the default browser after a short delay
Start-Sleep -Seconds 10
Start-Process "http://localhost:3000"

Write-Host "AutoTestGenie is starting up..."
Write-Host "Frontend will be available at: http://localhost:3000"
Write-Host "Backend API will be available at: http://localhost:8000"
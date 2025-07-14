import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Configure Google Generative AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables")
else:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="AutoTestGenie API", description="API for generating and running Selenium test scripts")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory for test files
TEMP_DIR = Path("./temp")
TEMP_DIR.mkdir(exist_ok=True)

class TestRequest(BaseModel):
    url: str
    actions: str
    html_code: str

class TestRunRequest(BaseModel):
    test_script: str

@app.get("/")
async def read_root():
    return {"message": "Welcome to AutoTestGenie API"}

@app.post("/generate-test")
async def generate_test(url: str = Form(...), 
                       actions: str = Form(...), 
                       html_code: str = Form(...)):
    
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    
    try:
        # Configure the model
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Create the prompt for Gemini
        prompt = f"""
        Generate a Python script using Selenium and Pytest to automate testing for a web page.
        
        URL: {url}
        
        HTML Code of the page:
        ```html
        {html_code}
        ```
        
        Test Actions to Automate:
        {actions}
        
        Requirements:
        1. Use Selenium WebDriver with Chrome
        2. Use Pytest as the testing framework
        3. Include proper assertions to verify actions
        4. Handle potential errors gracefully
        5. Add comments explaining the test steps
        6. Make the code clean, readable, and maintainable
        7. Include setup and teardown methods
        8. Use explicit waits where appropriate
        
        Return ONLY the Python code without any explanations.
        """
        
        # Generate the test script
        response = model.generate_content(prompt)
        test_script = response.text
        
        # Clean up the response to extract only the Python code
        if "```python" in test_script:
            test_script = test_script.split("```python")[1]
        if "```" in test_script:
            test_script = test_script.split("```")[0]
        
        # Save the test script to a temporary file
        test_file_path = TEMP_DIR / "test_script.py"
        with open(test_file_path, "w") as f:
            f.write(test_script)
        
        return FileResponse(
            path=test_file_path,
            filename="test_script.py",
            media_type="text/x-python"
        )
    
    except Exception as e:
        print(f"Error generating test: {e}") # Added for debugging
        raise HTTPException(status_code=500, detail=f"Error generating test: {e}")

@app.post("/run-test")
async def run_test(background_tasks: BackgroundTasks, test_script: str = Form(...)):
    try:
        # Save the test script to a temporary file
        test_file_path = TEMP_DIR / "test_script.py"
        with open(test_file_path, "w") as f:
            f.write(test_script)
        
        # Create a directory for the HTML report
        report_dir = TEMP_DIR / "report"
        report_dir.mkdir(exist_ok=True)
        
        # Run pytest with HTML report generation
        result = subprocess.run(
            [
                "pytest", 
                str(test_file_path), 
                "--html=" + str(report_dir / "report.html"),
                "--self-contained-html",
                "-v"
            ],
            capture_output=True,
            text=True
        )
        
        # Check if the HTML report was generated
        report_path = report_dir / "report.html"
        if not report_path.exists():
            return JSONResponse(
                status_code=500,
                content={
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "error": "Failed to generate HTML report"
                }
            )
        
        # Return the results
        print(f"Pytest stdout: {result.stdout}")
        print(f"Pytest stderr: {result.stderr}")
        return JSONResponse(content={
            "stdout": result.stdout,
            "stderr": result.stderr,
            "report_url": f"/download-report",
            "test_script_url": f"/download-script"
        })
    
    except Exception as e:
        print(f"Error running test: {e}") # Added for debugging
        raise HTTPException(status_code=500, detail=f"Error running test: {e}")

@app.get("/download-report")
async def download_report():
    report_path = TEMP_DIR / "report" / "report.html"
    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    
    return FileResponse(
        path=report_path,
        filename="test_report.html",
        media_type="text/html"
    )

@app.get("/download-script")
async def download_script():
    script_path = TEMP_DIR / "test_script.py"
    if not script_path.exists():
        raise HTTPException(status_code=404, detail="Test script not found")
    
    return FileResponse(
        path=script_path,
        filename="test_script.py",
        media_type="text/x-python"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
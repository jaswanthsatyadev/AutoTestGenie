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

        You can use the following libraries:
        - pytest
        - selenium
        - faker
        
        URL: {url}
        
        HTML Code of the page:
        ```html
        {html_code}
        ```
        
        Test Actions to Automate:
        {actions}
        
        Requirements:
        1. Use Selenium WebDriver with Chrome
        2. Configure Chrome options with:
           - `--headless`
           - `--no-sandbox`
           - `--disable-dev-shm-usage`
           - `--disable-gpu`
           - `--window-size=1920,1080`
           - `--remote-debugging-port=9222`
        3. Use Pytest as the testing framework
        4. Include proper assertions to verify actions
        5. Handle potential errors gracefully
        6. Add comments explaining the test steps
        7. Make the code clean, readable, and maintainable
        8. Include setup and teardown methods (e.g., using pytest fixtures)
        9. Use explicit waits (e.g., `WebDriverWait`) instead of implicit waits
        
        Return ONLY the Python code without any explanations. Ensure the script is a valid pytest test file and includes at least one function starting with `def test_`.
        """
        
        # Generate the test script
        try:
            response = model.generate_content(prompt, stream=True)
            
            test_script = ""
            for chunk in response:
                test_script += chunk.text
        except Exception as e:
            print(f"Error during Gemini API call: {e}")
            raise HTTPException(status_code=500, detail="Error communicating with Generative AI service")
        
        # Clean up the response to extract only the Python code
        if "```python" in test_script:
            test_script = test_script.split("```python")[1]
        if "```" in test_script:
            test_script = test_script.split("```")[0]
        
        # Save the test script to a temporary file
        test_file_path = TEMP_DIR / "test_selenium_script.py"
        
        # Check if the generated script contains a test function
        if "def test_" not in test_script:
            # If not, wrap the script in a test function that accepts a driver fixture
            wrapped_script = f"""
import pytest

def test_selenium_automation(driver):
    # Add a try-except block to catch exceptions during test execution
    try:
        {test_script}
    except Exception as e:
        pytest.fail(f"Test failed: {{e}}")
"""
            with open(test_file_path, "w") as f:
                f.write(wrapped_script)
        else:
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
        test_file_path = TEMP_DIR / "test_selenium_script.py"
        with open(test_file_path, "w") as f:
            f.write(test_script)
        print(f"Content of {test_file_path}:\n{test_script}")

        # Create conftest.py with a driver fixture
        conftest_content = """
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

@pytest.fixture(scope='function')
def driver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--remote-debugging-port=9222')
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()
"""
        conftest_file_path = TEMP_DIR / "conftest.py"
        with open(conftest_file_path, "w") as f:
            f.write(conftest_content)
        print(f"Content of {conftest_file_path}:\n{conftest_content}")
        
        # Create a directory for the HTML report
        report_dir = TEMP_DIR / "report"
        report_dir.mkdir(exist_ok=True)
        
        # Run pytest with HTML report generation
        result = subprocess.run(
            [
                "pytest",
                str(test_file_path.name),
                f"--html={report_dir / 'report.html'}",
                "--self-contained-html",
            ],
            capture_output=True,
            text=True,
            cwd=str(TEMP_DIR.absolute()),
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
    script_path = TEMP_DIR / "test_selenium_script.py"
    if not script_path.exists():
        raise HTTPException(status_code=404, detail="Test script not found")
    
    return FileResponse(
        path=script_path,
        filename="test_selenium_script.py",
        media_type="text/x-python"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
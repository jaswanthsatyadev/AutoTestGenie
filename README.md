# AutoTestGenie

AutoTestGenie is a full-stack web application that automatically generates Selenium + Pytest test scripts based on user inputs. The application takes a web page URL, a description of actions to perform, and the HTML code of the page, then generates and runs a test script.

## Features

- Generate Selenium + Pytest test scripts automatically
- Run tests and view results in real-time
- Download HTML test reports
- Download generated test scripts
- Dark/light theme toggle

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: FastAPI
- **Testing**: Selenium, Pytest
- **AI Integration**: Google Gemini API

## Prerequisites

- Node.js (v14 or later)
- Python (v3.8 or later)
- Chrome browser (for Selenium tests)
- ChromeDriver (compatible with your Chrome version)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Create a `.env` file in the backend directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

6. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter the URL of the web page you want to test
3. Describe the actions you want to automate
4. Paste the HTML code of the page
5. Click "Generate Test Script"
6. View the test results and download the generated script or HTML report

## Docker Support

To run the application using Docker:

1. Build the Docker images:
   ```
   docker-compose build
   ```

2. Start the containers:
   ```
   docker-compose up
   ```

3. Access the application at `http://localhost:3000`

## License

MIT
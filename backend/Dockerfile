FROM python:3.9-slim

WORKDIR /app

# Install Chrome and ChromeDriver for Selenium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && apt-get clean

# Install ChromeDriver
RUN apt-get update -y && apt-get install -y wget unzip jq curl \
    && CHROME_DRIVER_URL=$(curl -sS "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json" | \
    jq -r '.channels.Stable.downloads.chromedriver[] | select(.platform == "linux64") | .url') \
    && echo "Downloading from: $CHROME_DRIVER_URL" \
    && wget --continue -O /tmp/chromedriver_linux64.zip "$CHROME_DRIVER_URL" \
    && unzip /tmp/chromedriver_linux64.zip -d /tmp \
    && DRIVER_DIR=$(find /tmp -type d -name "chromedriver-linux64*") \
    && mv "$DRIVER_DIR/chromedriver" /usr/local/bin/chromedriver \
    && chmod +x /usr/local/bin/chromedriver \
    && rm /tmp/chromedriver_linux64.zip \
    && rm -rf "$DRIVER_DIR" \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create temp directory for test files
RUN mkdir -p ./temp/report

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies required for building Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make sure models directory is recognized as a package
# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8000"]

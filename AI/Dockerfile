# Use standard Python
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies (Updated for the newest Linux version)
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy your requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your actual code
COPY . .

# Hugging Face Spaces always run on port 7860
EXPOSE 7860

# Start the Flask app using Gunicorn on port 7860
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app", "--timeout", "120"]

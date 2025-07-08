# Use lightweight Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies + gdown
RUN apt-get update && apt-get install -y \
    ffmpeg libsm6 libxext6 wget git && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Create weights folder and download model from Google Drive
RUN mkdir -p CViT/weight && \
    gdown https://drive.google.com/file/d/1o4BnP36epEN3pVbXz6NS4dJO3SiJjg4D/view?usp=sharing -O CViT/weight/cvit2_deepfake_detection_ep_50.pth

# Copy app code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

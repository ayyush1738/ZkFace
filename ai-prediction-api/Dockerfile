# Base image
FROM python:3.11-slim

# Avoid pyc + unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (for dlib and CV libs)
RUN apt-get update && apt-get install -y \
    build-essential cmake \
    libboost-all-dev \
    ffmpeg libsm6 libxext6 \
    python3-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .

# Remove Windows .whl line if present from requirements.txt
# Instead, install dlib via pip
RUN pip install --upgrade pip && \
    pip install dlib && \
    pip install -r requirements.txt

# Download model from Google Drive (replace ID)
RUN pip install gdown && \
    mkdir -p CViT/weight && \
    gdown https://drive.google.com/file/d/1o4BnP36epEN3pVbXz6NS4dJO3SiJjg4D/view?usp=sharing -O CViT/weight/cvit2_deepfake_detection_ep_50.pth

# Copy the rest of the app
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


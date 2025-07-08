FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# --- Install system deps required by dlib ---
RUN apt-get update && apt-get install -y \
    build-essential cmake \
    libboost-all-dev \
    ffmpeg libsm6 libxext6 \
    python3-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# --- Install Python deps (skip dlib here to avoid build time) ---
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install gdown && \
    pip install --no-cache-dir -r requirements.txt || true  # skip dlib errors here

# --- Copy rest of the app ---
COPY . .

# --- Download model if not already present ---
RUN mkdir -p CViT/weight && \
    gdown https://drive.google.com/uc?id=1o4BnP36epEN3pVbXz6NS4dJO3SiJjg4D -O CViT/weight/cvit2_deepfake_detection_ep_50.pth

# --- Install dlib at runtime, not during build ---
CMD pip install dlib && \
    uvicorn main:app --host 0.0.0.0 --port 8000

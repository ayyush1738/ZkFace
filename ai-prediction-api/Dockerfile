FROM bamos/dlib:latest

# Set working directory
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install required tools
RUN apt-get update && apt-get install -y \
    ffmpeg libsm6 libxext6 python3-pip && \
    pip3 install --upgrade pip gdown

# Copy requirements and install your Python packages
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Download model from Google Drive (replace with your actual file ID)
RUN mkdir -p CViT/weight && \
    gdown https://drive.google.com/uc?id=1o4BnP36epEN3pVbXz6NS4dJO3SiJjg4D -O CViT/weight/cvit2_deepfake_detection_ep_50.pth

# Copy your source code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM faceimages/dlib-opencv:python3.11

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install gdown + any system packages you need
RUN apt-get update && apt-get install -y \
    ffmpeg libsm6 libxext6 && \
    pip install --upgrade pip gdown

# Copy requirements and install rest
COPY requirements.txt .
RUN pip install -r requirements.txt

# Download model (REPLACE YOUR_MODEL_ID)
RUN mkdir -p CViT/weight && \
    gdown https://drive.google.com/uc?id=1o4BnP36epEN3pVbXz6NS4dJO3SiJjg4D -O CViT/weight/cvit2_deepfake_detection_ep_50.pth

# Copy your entire app
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

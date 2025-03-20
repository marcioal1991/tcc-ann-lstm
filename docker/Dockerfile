FROM tensorflow/tensorflow:2.13.0-gpu

RUN apt update && apt install -y \
    curl \
    gnupg \
    build-essential \
    python3 \
    ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt install -y nodejs && \
    npm install -g npm && \
    apt clean

ENV LD_LIBRARY_PATH=/usr/local/cuda/lib64

WORKDIR /app
COPY . .
RUN npm install

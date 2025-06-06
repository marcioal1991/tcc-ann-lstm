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

RUN apt-get update && apt-get install -y --no-install-recommends \
    libcudnn8=8.9.4.*-1+cuda11.8 \
    libcublas-11-8 \
    && rm -rf /var/lib/apt/lists/*

#ENV LD_LIBRARY_PATH=/usr/local/cuda/lib64
ENV LD_LIBRARY_PATH=/usr/local/cuda/lib64:/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
ENV TF_CPP_MIN_LOG_LEVEL=3

WORKDIR /app
COPY . .
RUN npm install

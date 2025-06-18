FROM mcr.microsoft.com/devcontainers/typescript-node:20

RUN apt-get update && apt-get install -y redis-tools && rm -rf /var/lib/apt/lists/*

# RUN chown -R node:node /workspace
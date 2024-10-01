# Use an official lightweight Linux base image
FROM ubuntu:22.04

# Set environment variables to avoid prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    git \
    build-essential \
    libfontconfig1 \
    ca-certificates \
    unzip \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Bun (JavaScript runtime)
RUN curl https://bun.sh/install | bash

# Ensure bun is in the PATH
ENV PATH="/root/.bun/bin:${PATH}"

# Verify bun installation
RUN bun -v

# Install Typst (markup-based typesetting system)
RUN curl -L https://github.com/typst/typst/releases/download/v0.11.1/typst-x86_64-unknown-linux-musl.tar.xz -o typst.tar.xz \
    && tar -xf typst.tar.xz \
    && mv typst-x86_64-unknown-linux-musl/typst /usr/local/bin/ \
    && rm typst.tar.xz \
    && rm -r typst-x86_64-unknown-linux-musl

# Verify typst installation
RUN typst --version

# Set default working directory
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install Bun Deps
RUN bun install

# Run the app
CMD ["bun", "run", "start"]

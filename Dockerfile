# Use slim Python base image for smaller size
FROM python:3.11

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Set working directory
WORKDIR /app

# Install Node.js and npm early and in a separate layer for caching
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    npm \
 && rm -rf /var/lib/apt/lists/*

# Install backend dependencies early (cached until requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Copy only frontend package.json for caching
COPY HypeTrade307/package.json HypeTrade307/package-lock.json ./HypeTrade307/

# Install frontend dependencies
WORKDIR /app/HypeTrade307
RUN npm install

# Now copy rest of the frontend source
COPY HypeTrade307/src/ ./src/
COPY HypeTrade307/public/ ./public/
COPY HypeTrade307/index.html ./
COPY HypeTrade307/vite.config.ts ./
COPY HypeTrade307/tsconfig.json ./
COPY HypeTrade307/tsconfig.node.json ./
COPY HypeTrade307/tsconfig.app.json ./

# Build the frontend
RUN npm run build

# Go back to backend root
WORKDIR /app

# Add and prep start script
COPY start.sh .
RUN chmod +x start.sh

# Expose port
EXPOSE 8080

# Start the app
CMD ["./start.sh"]
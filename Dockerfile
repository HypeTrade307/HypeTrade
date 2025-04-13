# Use Python base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy backend requirements first (for better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy frontend files
COPY HypeTrade307/package.json HypeTrade307/package-lock.json ./HypeTrade307/
WORKDIR /app/HypeTrade307
RUN npm install

# Copy frontend source code
COPY HypeTrade307/src/ ./src/
COPY HypeTrade307/public/ ./public/
COPY HypeTrade307/index.html ./
COPY HypeTrade307/vite.config.ts ./
COPY HypeTrade307/tsconfig.json ./
COPY HypeTrade307/tsconfig.node.json ./
COPY HypeTrade307/tsconfig.app.json ./

# Build the React app
RUN npm run build

# Set working directory back to root
WORKDIR /app

# Add a script to run both services
COPY start.sh .
RUN chmod +x start.sh

# Expose port for the backend
EXPOSE 8080

# Start the application
CMD ["./start.sh"]
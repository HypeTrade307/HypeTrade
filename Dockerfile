# Stage 1: Frontend build
FROM node:20 as frontend-builder
WORKDIR /app
COPY HypeTrade307/package*.json ./
RUN npm install
COPY HypeTrade307/ ./
RUN npm run build

# Stage 2: Backend + Static bundle
FROM python:3.11
WORKDIR /app

# Backend deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Copy built frontend (from builder)
COPY --from=frontend-builder /app/dist ./frontend

# Start script
COPY start.sh .
RUN chmod +x start.sh

EXPOSE 8080
CMD ["./start.sh"]
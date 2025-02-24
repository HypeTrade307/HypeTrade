# build the frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY HypeTrade307/ .  
RUN npm install && npm run build

# set up the python backend
FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9

WORKDIR /app
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist 

COPY backend/ . 
COPY src/ ./src  

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8080
ENV HOST 0.0.0.0

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]
FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11

WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8080
ENV HOST=0.0.0.0

ADD start.sh /
RUN chmod +x /start.sh
CMD ["./start.sh"]
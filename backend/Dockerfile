FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9

# set working directory
WORKDIR /app

# copy backend files
COPY . /app

# install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# copy react build to serve
COPY dist /app/dist

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]
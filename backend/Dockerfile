# use official python image
FROM python:3.9

# set the working directory
WORKDIR /app

# copy files to container
COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

# expose the required port
EXPOSE 8080

# start the app with gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]
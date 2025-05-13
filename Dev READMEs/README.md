
------------------------------------------------------------------------------------------------------------------------
For the Dev team:

Step 1: "pip install -r requirements.txt", make sure that the dependencies will work (they might not be on the PATH).

Step 2: Install and setup MySQL (make sure to download MySQL Workbench, it is very good at checking if data is persistent.)

Step 3: go to database.py and fill in this code:

"DATABASE_URL = "mysql+mysqlconnector://{username}:{password}@{hostname}/{db_name}"

Step 4: run "alembic init alembic" from the directory where "src" directory is located. (i.e., run the command from the directory that has HypeTrade307 and src.)

Step 5: Paste this code somewhere before seed_stocks() call if you already don't have in main.py: "Base.metadata.create_all(bind=engine)"

Step 6: run "alembic stamp head"

Step 7: Paste this code to the beginning of env.py:

```
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from src.db.models import Base
import os
from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "mysecret")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "test")
# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

db_url = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
config.set_main_option("sqlalchemy.url", db_url)
```

above def run_migrations_offline() function definiton.


Step 8: run "alembic revision --autogenerate -m "Initial Migration"

Step 9: run "alembic upgrade head"

Step 10: Everything should hopefully be okay now, run "uvicorn src.main:app --reload" from the directory that contains HypeTrade307 and src.

IGNORE (DEPRECATED) (SCROLL FURTHER DOWN):
deploy:
docker buildx build \
--platform=linux/amd64 \
--cache-from=type=local,src=.build-cache \
--cache-to=type=local,dest=.build-cache \
-t us-central1-docker.pkg.dev/basic-formula-451520-c0/hypetrade-repo/hypetrade-app:ADD v<x> \
--push .

IGNORE (DEPRECATED) (SCROLL FURTHER DOWN):
gcloud:
gcloud run deploy hypet \
--image=us-central1-docker.pkg.dev/basic-formula-451520-c0/hypetrade-repo/hypetrade-app:latest \
--platform=managed \
--region=us-central1 \
--allow-unauthenticated \
--env-vars-file .env.yaml \
--add-cloudsql-instances=basic-formula-451520-c0:us-central1:hypetrade-db

----------------------------------------------------------------------------------------------

step 1:

Set up docker:

install app from https://www.docker.com/products/docker-desktop/

start the app (whenever the app is running, docker is running, so if you close the app, docker will not run)

test with these commands:

docker --version

docker run hello-world

docker faq at bottom of page

Note: you will periodically need to go into the docker desktop app to delete old builds to save space.

-----------------------------------------------------------------------
step 2:

Set up gcli credentials (run one by one):

gcloud auth login

gcloud config set project basic-formula-451520-c0


To verify creds:

gcloud auth configure-docker us-central1-docker.pkg.dev

-----------------------------------------------------------------------
step 3:

For testing your code:

Commit changes, then run the following unified command. I recommend waiting till the end of your session to push.
It will take ~20 mins the first time, but after that, it'll take a lot lesser, ~3 mins.

If any of the following commands break, you don't need to run each of them again,

you can just run the one that broke and onwards.

Whenever you're ready, feel free to push your changes. If on main, GCR will automatically update

the website w your changes (automatically = ~20 mins). In 99% of cases, if the following worked,

the GCR build will be successful. In case you want to track progress, the following url contains build history:

https://console.cloud.google.com/cloud-build/builds?project=basic-formula-451520-c0

You can open the latest, see if it matches your latest commit id, and check if there were any errors.

your isolated url should be diff and at the bottom of the output for aforementioned command

lmk if anything else

[need to have docker set up]

**_[IMPORTANT: add your name in line 139 in place of mine. it'll set up a service isolated to you, and you can test, debug and deploy on your own]_**

this is your command:
export IMAGE_NAME=us-central1-docker.pkg.dev/basic-formula-451520-c0/hypetrade-repo/hypetrade-app && \
export SHORT_SHA=$(git rev-parse --short HEAD) && \
DOCKER_BUILDKIT=1 docker build \
--platform=linux/amd64 \
--cache-from=type=local,src=.build-cache \
--cache-to=type=inline \
-t $IMAGE_NAME:$SHORT_SHA \
. && \
docker push $IMAGE_NAME:$SHORT_SHA && \
gcloud run deploy hypet-aditya \
--image=us-central1-docker.pkg.dev/basic-formula-451520-c0/hypetrade-repo/hypetrade-app:$SHORT_SHA \
--platform=managed \
--region=us-central1 \
--allow-unauthenticated \
--env-vars-file .env.yaml \
--add-cloudsql-instances=basic-formula-451520-c0:us-central1:hypetrade-db

(exports latest commit id as an env var, creates a docker build for it, pushes it to a docker repo)

(95% sure this is automatically set up), and then deploys it to a url that will be at the bottom of the output)

Notes:

Further, the website logs are here:

https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_run_revision%22%0Aresource.labels.service_name%3D%22hypet%22%0Aseverity%3E%3DDEFAULT;storageScope=project;cursorTimestamp=2025-04-20T04:39:40.025482Z;duration=P1D?project=basic-formula-451520-c0

And finally, the actual url (for now) is:

https://hypet-145797464141.us-central1.run.app

Cloud SQL, you can view, edit and run commands for the db here:

https://console.cloud.google.com/sql/instances/hypetrade-db/studio?project=basic-formula-451520-c0

db is hypetrade-db, user should be the first one (hypetrade-user), pw is my_db_pw

--------------------------------------------------------------------------------------------
docker faq courtesy of chad
-----------------------------
Common Issues
-----------------------------

- Docker says "Cannot connect to the Docker daemon":
  → Make sure Docker Desktop is running.

- You get permission errors when pushing:
  → Make sure you've run `gcloud auth configure-docker` and have permission on the GCP project.

- Docker build is very slow:
  → Consider using build cache, multi-stage builds, and pruning unused layers. --> WE DO THIS LOCALLY

-----------------------------
Docker Commands Cheat Sheet
-----------------------------

- Build an image:
  docker build -t my-image-name .

- Tag an image:
  docker tag my-image-name registry/image-name:tag

- List images:
  docker images

- Remove an image:
  docker rmi image-id

- Run a container:
  docker run -it my-image-name

- Stop a container:
  docker ps
  docker stop container-id

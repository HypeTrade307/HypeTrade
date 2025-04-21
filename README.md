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

deploy:
docker buildx build \
--platform=linux/amd64 \
--cache-from=type=local,src=.build-cache \
--cache-to=type=local,dest=.build-cache \
-t us-central1-docker.pkg.dev/basic-formula-451520-c0/hypetrade-repo/hypetrade-app:ADD v<x> \
--push .

gcloud:
gcloud run deploy hypet \
--image=us-central1-docker.pkg.dev/basic-formula-451520-c0/hypetrade-repo/hypetrade-app:latest \
--platform=managed \
--region=us-central1 \
--allow-unauthenticated \
--env-vars-file .env.yaml \
--add-cloudsql-instances=basic-formula-451520-c0:us-central1:hypetrade-db

RUN BEFORE (every time you use in a new terminal):
export IMAGE_NAME=us-central1-docker.pkg.dev/basic-formula-451520-c0/hypetrade-repo/hypetrade-app
export SHORT_SHA=$(git rev-parse --short HEAD)

updated:
DOCKER_BUILDKIT=1 docker build \
--platform=linux/amd64 \
--cache-from=type=local,src=.build-cache \
--cache-to=type=inline \
-t $IMAGE_NAME:$SHORT_SHA \
-t $IMAGE_NAME:latest \
. \
&& \
docker push $IMAGE_NAME:$SHORT_SHA && \
docker push $IMAGE_NAME:latest \
&& \
gcloud run deploy hypet \
--image=us-central1-docker.pkg.dev/basic-formula-451520-c0/hypetrade-repo/hypetrade-app:$SHORT_SHA \
--platform=managed \
--region=us-central1 \
--allow-unauthenticated \
--env-vars-file .env.yaml \
--add-cloudsql-instances=basic-formula-451520-c0:us-central1:hypetrade-db
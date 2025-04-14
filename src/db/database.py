import os

from pwiz import DATABASE_MAP
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
load_dotenv()
# os.environ["DATABASE_URL"] = "mysql+pymysql://hypetrade-user:my_db_pw@localhost/hypetrade?unix_socket=/tmp/cloudsql/basic-formula-451520-c0:us-central1:hypetrade-db"
DATABASE_URL=os.getenv("DATABASE_URL")
print("DB URL IS", DATABASE_URL)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

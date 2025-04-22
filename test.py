from sqlalchemy import create_engine, text
from fastapi import FastAPI, HTTPException
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
engine = create_engine(os.getenv("DATABASE_URL"))

@app.get("/ping-db")
def ping_db():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"db error: {e}")
print(ping_db)
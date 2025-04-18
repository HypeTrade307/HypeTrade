from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import uvicorn
from fastapi import HTTPException
import json

# import backend functions
from src import check_if_friends as cf, search_users as su

# import database setup
from src.db import crud
from src.db.database import SessionLocal, engine, Base
from src.api.routes.notifications import router as notification_router
from src.api.routes.users import router as users_router
from src.api.routes.stocks import router as stocks_router
from src.api.routes.portfolios import router as portfolio_router
from src.api.routes.forum import router as forum_router
from src.api.routes.auth import router as auth_router
from src.api.routes.sentiment import router as sentiment_router
from src.api.routes.threads import router as threads_router
from src.api.routes.posts import router as posts_router, comment_router
from src.api.routes.friends import router as friends_router
from src.processing.stock_processing import seed_stocks
from src.processing import scraping as sc
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))  # add src to path
app = FastAPI()
# app.mount("/", StaticFiles(directory="HypeTrade307/", html=True), name="static")

Base.metadata.create_all(bind=engine)
sc.test_reddit_connection()

# @app.on_event("startup")
# def on_startup():
#     with SessionLocal() as db:
#         seed_stocks(db)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL for security (e.g., "http://localhost:3000")
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # Allows all headers
)

Base.metadata.create_all(bind=engine)

seed_stocks(db=SessionLocal())

# text input model
class InputData(BaseModel):
    text: str

@app.post("/process")
def process_text(data: InputData) -> List[str]:  
    return su.search(data.text)

# include users router from main.py
app.include_router(users_router)
app.include_router(threads_router)
app.include_router(stocks_router)
app.include_router(portfolio_router)
app.include_router(forum_router)
app.include_router(auth_router)
app.include_router(notification_router)
app.include_router(sentiment_router)
app.include_router(posts_router)
app.include_router(comment_router)
app.include_router(friends_router)
# additional routes from main.py
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "Welcome to the Stocks Social Media"}

# entry point
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))  # cloud run requires PORT env var
    uvicorn.run(app, host="0.0.0.0", port=port)
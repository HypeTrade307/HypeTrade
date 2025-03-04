from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os, sys
import uvicorn

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'services')))
# import backend functions
import search_users as su
import check_if_friends as cf

# import database setup
from src.db.database import engine, Base
from src.api.routes.users import router as users_router

# create FastAPI app
app = FastAPI()

# enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (change this in production)
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# friend check request model
class FriendCheckRequest(BaseModel):
    current_user: str
    requested_user: str

# friend modification request model
class FriendModifyRequest(BaseModel):
    current_user: str
    add_user: Optional[str] = None
    remove_user: Optional[str] = None

# text input model
class InputData(BaseModel):
    text: str

# routes from server.py
@app.post("/check_friends")
def check_friends(request: FriendCheckRequest):
    friend_list = cf.check_friends(request.current_user, request.requested_user)
    return {"friends": friend_list if friend_list else []}

@app.post("/add_friend")
def add_friend(request: FriendModifyRequest):
    if request.add_user:
        cf.add_to_friendlist(request.current_user, request.add_user)
    return {"message": "Friend request sent"}

@app.post("/remove_friend")
def remove_friend(request: FriendModifyRequest):
    if request.remove_user:
        cf.remove_from_friendlist(request.current_user, request.remove_user)
    return {"message": "Friend removed"}

@app.post("/process")
def process_text(data: InputData) -> List[str]:  
    return su.search(data.text)

# include users router from main.py
app.include_router(users_router)

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
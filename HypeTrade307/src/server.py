from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Optional
from ...backend import check_if_friends as cf  # import your existing logic

app = FastAPI()

class FriendCheckRequest(BaseModel):
    current_user: str
    requested_user: str

class FriendModifyRequest(BaseModel):
    current_user: str
    add_user: Optional[str] = None
    remove_user: Optional[str] = None

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
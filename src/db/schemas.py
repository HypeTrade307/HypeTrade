from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    title: str
    post_url: str
    content: str
    author_id: int

class PostResponse(BaseModel):
    post_id: int
    title: str
    post_url: str
    content: str
    created_at: datetime
    author_id: int

    class Config:
        from_attributes = True

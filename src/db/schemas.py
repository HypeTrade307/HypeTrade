from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ------------------
#  USER SCHEMAS
# ------------------
class UserBase(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    name: str
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None  # optional if only updating name/email

class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ------------------
#  POST SCHEMAS
# ------------------
class PostBase(BaseModel):
    title: Optional[str] = None
    post_url: Optional[str] = None
    content: Optional[str] = None

class PostCreate(PostBase):
    title: str
    post_url: str
    content: str
    author_id: int

class PostUpdate(PostBase):
    pass  # For partial updates

class PostResponse(BaseModel):
    post_id: int
    title: str
    post_url: str
    content: str
    author_id: int
    created_at: datetime

    class Config:
        from_attributes = True

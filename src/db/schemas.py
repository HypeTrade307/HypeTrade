from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

# ------------------
#  USER SCHEMAS
# ------------------
class UserBase(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(UserBase):
    username: str
    email: EmailStr
    password: str
    confirmation_code: int

class UserUpdate(UserBase):
    password: Optional[str] = None  # optional if only updating name/email

class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserPasswordUpdate(BaseModel):
    old_password: str
    new_password: str

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
# ------------------
#  STOCK SCHEMAS
# ------------------
class StockBase(BaseModel):
    stock_id: Optional[int] = None
    ticker: Optional[str] = None
    stock_name: Optional[str] = None
class StockCreate(BaseModel):
    ticker: str
    stock_name: str
    analysis_mode: Optional[str] = "on_demand"  # e.g., "auto" or "on_demand"

class StockUpdate(BaseModel):
    ticker: Optional[str] = None
    stock_name: Optional[str] = None
    analysis_mode: Optional[str] = None

class StockResponse(BaseModel):
    stock_id: int
    ticker: str
    stock_name: str
    analysis_mode: str

    class Config:
        from_attributes = True

# ----------------------------
#  PORTFOLIO SCHEMAS
# ----------------------------

class PortfolioBase(BaseModel):
    portfolio_name: Optional[str] = None
    stocks: Optional[List[int]] = None  # Consider using stock IDs instead of StockResponse

class PortfolioCreate(BaseModel):
    portfolio_name: str
    stocks: Optional[List[int]] = []  # List of stock IDs

class PortfolioUpdate(BaseModel):
    portfolio_name: Optional[str] = None
    stocks: Optional[List[int]] = None

class PortfolioResponse(BaseModel):
    portfolio_id: int
    portfolio_name: str
    stocks: List['StockResponse']  # Assuming StockResponse is defined elsewhere

    class Config:
        from_attributes = True  # If using Pydantic v1; use `from_attributes = True` in v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# -----
# Thread
# -----

class ThreadCreate(BaseModel):
    title: str
    creator_id: int
    stock_id: int

class ThreadResponse(BaseModel):
    thread_id: int
    title: str
    stock_id: int
    created_at: datetime
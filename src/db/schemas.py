from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

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
# ------------------
#  STOCK SCHEMAS
# ------------------
class StockCreate(BaseModel):
    ticker: str
    name: str
    analysis_mode: Optional[str] = "on_demand"  # e.g., "auto" or "on_demand"

class StockUpdate(BaseModel):
    ticker: Optional[str] = None
    name: Optional[str] = None
    analysis_mode: Optional[str] = None

class StockResponse(BaseModel):
    stock_id: int
    ticker: str
    name: str
    analysis_mode: str

    class Config:
        from_attributes = True

# ----------------------------
#  PORTFOLIO SCHEMAS
# ----------------------------

class PortfolioBase(BaseModel):
    name: Optional[str] = None
    stocks: Optional[List[int]] = None  # Consider using stock IDs instead of StockResponse

class PortfolioCreate(BaseModel):
    name: str
    stocks: Optional[List[int]] = []  # List of stock IDs

class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    stocks: Optional[List[int]] = None

class PortfolioResponse(BaseModel):
    portfolio_id: int
    name: str
    stocks: List['StockResponse']  # Assuming StockResponse is defined elsewhere

    class Config:
        from_attributes = True  # If using Pydantic v1; use `from_attributes = True` in v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
from enum import Enum
from typing import List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, EmailStr

# ------------------
#  FLAG SCHEMAS
# ------------------

class FlagBase(BaseModel):
    flag_id: int

class FlagType(str, Enum):
    user = "user"
    post = "post"
    comment = "comment"
    thread = "thread"

class FlagCreate(BaseModel):
    flag_type: FlagType
    target_id: int
    reason: Optional[str] = None

class FlagResponse(BaseModel):
    flag_id: int
    user_id: int
    flag_type: FlagType
    target_id : int
    reason: Optional[str] = None  # Optional reason for the flag
    created_at: datetime

    class Config:
        from_attributes = True  # If using Pydantic v1; use `from_attributes = True` in v2


# ------------------
#  FRIEND REQUEST SCHEMAS
# ------------------

class FriendRequestStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    blocked = "blocked"

class FriendRequestBase(BaseModel):
    sender_id: int
    receiver_id: int
    status: str

class FriendRequestCreate(FriendRequestBase):
    pass

class FriendRequestResponse(FriendRequestBase):
    request_id: int
    created_at: datetime
    sender_username: str

    class Config:
        orm_mode = True

class FriendRequestAction(BaseModel):
    current_user: int
    add_user: int

class FriendResponse(BaseModel):
    user_id: int
    username: str
    email: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

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
    content: Optional[str] = None

class PostCreate(PostBase):
    title: str
    content: str

class PostUpdate(PostBase):
    pass  # For partial updates

class PostResponse(BaseModel):
    post_id: int
    thread_id: int
    author_id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    # author: Optional[dict] = None
    liked_by: Optional[List[dict]] = None

    class Config:
        from_attributes = True

# ------------------
#  COMMENT SCHEMAS
# ------------------
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

# class CommentResponse(CommentBase):
#     comment_id: int
#     post_id: int
#     author_id: int
#     created_at: datetime
#     author: Optional[dict] = None
#     liked_by: Optional[List[dict]] = None
#
#     class Config:
#         from_attributes = True

class CommentResponse(BaseModel):
    id: int
    text: str  # Ensure this matches what's in the database
    content: str  # If required, add this field
    comment_id: int
    post_id: int
    author_id: int
    created_at: datetime
    author: Optional[UserResponse]

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
    stock_id: int

class ThreadResponse(BaseModel):
    thread_id: int
    title: str
    stock_id: int
    created_at: datetime

# ----------------------------
# NOTIFICATION
# ----------------------------
class NotificationBase(BaseModel):
    message: str
    sender_id: int 
    receiver_id: int
    
class NotificationUpdate(BaseModel):
    is_read: bool = True

class Notification(NotificationBase):
    notification_id: int
    created_at: datetime
    is_read: bool = False
    
    class Config:
        from_attributes = True

class NotificationCreate(BaseModel):
    receiver_id: int
    message: str
    stock_id: Optional[int] = None
    
    class Config:
        from_attributes = True

# ----------------------------
# SENTIMENT ANALYSIS
# ----------------------------

class SentimentBase(BaseModel):
    stock_id: int  # ID of the stock for which sentiment is analyzed
    ticker: str  # Keyword used for sentiment analysis
    timestamp: datetime  # Timestamp of the sentiment analysis
    sentiment_value: float  # Sentiment value (from -10 to 10)

class SentimentRequest(BaseModel):
    stock_id: int  # ID of the stock for which sentiment is analyzed
    ticker: str  # Keyword used for sentiment analysis

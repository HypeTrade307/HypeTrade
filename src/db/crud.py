import datetime
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.processing.scraping import parse_timeframe
from . import models, schemas
from passlib.hash import bcrypt as hashing
# ----------------------------
#  USER CRUD
# ----------------------------
def create_user(db: Session, user_data: schemas.UserCreate):
    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_name(db: Session, name: str):
    return db.query(models.User).filter(models.User.username.like(f'%{name}%')).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, user_update: schemas.UserBase):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        return None

    if user_update.username is not None:
        db_user.username = user_update.username
    if user_update.email is not None:
        db_user.email = user_update.email

    db.commit()
    db.refresh(db_user)
    return db_user

def get_password(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        return None
    return db_user.password

def update_password(db: Session, user_id: int, new_password: str):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        return None
    db_user.password = hashing.hash(new_password)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        return None
    db.delete(db_user)
    db.commit()
    return db_user

# Adding to the existing crud.py file

# --- Comment CRUD operations ---

def get_comment_by_id(db: Session, comment_id: int):
    """
    Get a comment by its ID.
    """
    return db.query(models.Comment).filter(models.Comment.comment_id == comment_id).first()

def get_comments_by_post_id(db: Session, post_id: int):
    comments = db.query(models.Comment).filter(models.Comment.post_id == post_id).all()

    return [
        {
            "content": comment.content,  # Ensure this field exists
            "comment_id": comment.comment_id,  # Ensure this exists
            "post_id": comment.post_id,
            "author_id": comment.author.user_id,
            "created_at": comment.created_at,
            "author": {
                "id": comment.author.user_id,
                "username": comment.author.username
            } if comment.author else None
        }
        for comment in comments
    ]

def create_comment(db: Session, content: str, author_id: int, post_id: int):
    """
    Create a new comment.
    """
    comment = {
        "content": content,  # Ensure this field exists
        "post_id": post_id,
        "author_id": author_id,
        "created_at": datetime.datetime.now()
    }
    comment = models.Comment(content=content,
    post_id= post_id,
    author_id= author_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Format the author and liked_by information for the response
    comment.liked_by = []

    return comment

def update_comment(db: Session, comment_id: int, comment_data: dict):
    """
    Update a comment with the provided data.
    """
    comment = db.query(models.Comment).filter(models.Comment.comment_id == comment_id).first()
    if comment:
        for key, value in comment_data.items():
            setattr(comment, key, value)
        db.commit()
        db.refresh(comment)

        # Format the author and liked_by information for the response
        if comment.author:
            comment.author = {
                "user_id": comment.author.user_id,
                "username": comment.author.username,
                "profile_picture": getattr(comment.author, "profile_picture", None)
            }
        comment.liked_by = [
            {"user_id": user.user_id, "username": user.username}
            for user in comment.liked_by
        ]

    return comment

def delete_comment(db: Session, comment_id: int):
    """
    Delete a comment by its ID.
    """
    comment = db.query(models.Comment).filter(models.Comment.comment_id == comment_id).first()
    if comment:
        db.delete(comment)
        db.commit()
        return True
    return False

# --- Post like/unlike operations ---

def add_post_like(db: Session, post_id: int, user_id: int):
    """
    Add a like to a post.
    Returns True if added successfully, False if already liked.
    """
    post = db.query(models.Post).filter(models.Post.post_id == post_id).first()
    user = db.query(models.User).filter(models.User.user_id == user_id).first()

    if not post or not user:
        return False

    # Check if user already liked this post
    if user in post.liked_by:
        return False

    post.liked_by.append(user)
    db.commit()
    return True

def remove_post_like(db: Session, post_id: int, user_id: int):
    """
    Remove a like from a post.
    Returns True if removed successfully, False if not liked.
    """
    post = db.query(models.Post).filter(models.Post.post_id == post_id).first()
    user = db.query(models.User).filter(models.User.user_id == user_id).first()

    if not post or not user:
        return False

    # Check if user has liked this post
    if user not in post.liked_by:
        return False

    post.liked_by.remove(user)
    db.commit()
    return True

# --- Comment like/unlike operations ---

def add_comment_like(db: Session, comment_id: int, user_id: int):
    """
    Add a like to a comment.
    Returns True if added successfully, False if already liked.
    """
    comment = db.query(models.Comment).filter(models.Comment.comment_id == comment_id).first()
    user = db.query(models.User).filter(models.User.user_id == user_id).first()

    if not comment or not user:
        return False

    # Check if user already liked this comment
    if user in comment.liked_by:
        return False

    comment.liked_by.append(user)
    db.commit()
    return True

def remove_comment_like(db: Session, comment_id: int, user_id: int):
    """
    Remove a like from a comment.
    Returns True if removed successfully, False if not liked.
    """
    comment = db.query(models.Comment).filter(models.Comment.comment_id == comment_id).first()
    user = db.query(models.User).filter(models.User.user_id == user_id).first()

    if not comment or not user:
        return False

    # Check if user has liked this comment
    if user not in comment.liked_by:
        return False

    comment.liked_by.remove(user)
    db.commit()
    return True

# ----------------------------
#  POST CRUD
# ----------------------------
def create_post(db: Session, thread_id: int, title: str = None, content: str = None, created_by: int = None):
    db_post = models.Post(title=title, content=content, author_id=created_by, thread_id=thread_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


def get_post_by_id(db: Session, post_id: int) -> models.Post:
    """
    Retrieve a post by its ID with author and likes information.
    """
    post = db.query(models.Post).filter(models.Post.post_id == post_id).first()
    return post




def update_post(db: Session, post_id: int, post_data: dict):
    """
    Update a post with the provided data.
    """
    post = db.query(models.Post).filter(models.Post.post_id == post_id).first()
    if post:
        for key, value in post_data.items():
            setattr(post, key, value)
        db.commit()
        db.refresh(post)
    return post


def get_posts_by_thread_id(db: Session, thread_id : int, skip: int = 0, limit: int = 10) -> list[models.Post]:
    return db.query(models.Post).filter(models.Post.thread_id == thread_id).offset(skip).limit(limit).all()


def delete_post(db: Session, post_id: int):
    db_post = db.query(models.Post).filter(models.Post.post_id == post_id).first()
    if not db_post:
        return None
    db.delete(db_post)
    db.commit()
    return db_post

# ----------------------------
#  STOCK CRUD
# ----------------------------
def create_stock(db: Session, stock_data: schemas.StockCreate) -> models.Stock:
    """Create a new Stock entry in the database."""
    # Check if ticker already exists
    existing_stock = db.query(models.Stock).filter_by(ticker=stock_data.ticker).first()
    if existing_stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ticker '{stock_data.ticker}' already exists."
        )
    new_stock = models.Stock(
        ticker=stock_data.ticker,
        stock_name=stock_data.stock_name,
        analysis_mode=stock_data.analysis_mode
    )
    db.add(new_stock)
    db.commit()
    db.refresh(new_stock)
    return new_stock


def get_stock(db: Session, stock_id: int) -> models.Stock:
    """Retrieve a single stock by its ID."""
    stock = db.query(models.Stock).filter_by(stock_id=stock_id).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock with ID {stock_id} not found."
        )
    return stock


def get_stocks(db: Session) -> list[models.Stock]:
    """Retrieve a list of stocks, with pagination."""
    return db.query(models.Stock).all()


def update_stock(db: Session, stock_id: int, stock_data: schemas.StockUpdate) -> models.Stock:
    """Update an existing stock."""
    stock = db.query(models.Stock).filter_by(stock_id=stock_id).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock with ID {stock_id} not found."
        )

    # Only update fields that are provided
    if stock_data.ticker is not None:
        # Optionally check for duplicates if changing ticker
        existing = db.query(models.Stock).filter_by(ticker=stock_data.ticker).first()
        if existing and existing.stock_id != stock_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ticker '{stock_data.ticker}' already in use."
            )
        stock.ticker = stock_data.ticker

    if stock_data.stock_name is not None:
        stock.stock_name = stock_data.stock_name

    if stock_data.analysis_mode is not None:
        stock.analysis_mode = stock_data.analysis_mode

    db.commit()
    db.refresh(stock)
    return stock


def delete_stock(db: Session, stock_id: int) -> None:
    """Delete a stock from the database."""
    stock = db.query(models.Stock).filter_by(stock_id=stock_id).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock with ID {stock_id} not found."
        )

    db.delete(stock)
    db.commit()

def get_top_stocks(db: Session) -> list[models.Stock]:
    stocks = db.query(models.Stock).filter(
        models.Stock.analysis_mode == "auto"
    ).all()
    return stocks

# ----------------------------
#  PORTFOLIO CRUD
# ----------------------------

def create_portfolio(db: Session, user_id: int, portfolio_name: str) -> models.Portfolio:
    existing_portfolio = db.query(models.Portfolio).filter(models.Portfolio.user_id == user_id, models.Portfolio.portfolio_name == portfolio_name).first()
    if (existing_portfolio):
        raise HTTPException(status_code=400, detail="Portfolio with this name already exists.")
    new_portfolio = models.Portfolio(user_id = user_id, portfolio_name = portfolio_name)
    db.add(new_portfolio)
    db.commit()
    db.refresh(new_portfolio)
    return new_portfolio

def get_portfolio(db: Session, portfolio_id: int) -> models.Portfolio:
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.portfolio_id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    return portfolio

def get_portfolios_by_user(db: Session, user_id: int) -> list[models.Portfolio]:
    return (
        db.query(models.Portfolio)
        .filter(models.Portfolio.user_id == user_id)
        .all()
    )


def update_portfolio(db: Session, portfolio_id: int, new_name: str) -> models.Portfolio:
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.portfolio_id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    portfolio.portfolio_name = new_name
    db.commit()
    db.refresh(portfolio)
    return portfolio

def delete_portfolio(db: Session, portfolio_id: int) -> None:
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.portfolio_id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    db.delete(portfolio)
    db.commit()


# ----- Additional Portfolio Functionality -----

def add_stock_to_portfolio(db: Session, portfolio_id: int, stock_id: int) -> models.Portfolio:
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.portfolio_id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    stock = db.query(models.Stock).filter(models.Stock.stock_id == stock_id).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found.")

    if stock in portfolio.stocks:
        raise HTTPException(status_code=400, detail="Stock already in portfolio.")

    portfolio.stocks.append(stock)
    db.commit()
    db.refresh(portfolio)
    return portfolio

def remove_stock_from_portfolio(db: Session, portfolio_id: int, stock_id: int) -> models.Portfolio:
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.portfolio_id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    stock = db.query(models.Stock).filter(models.Stock.stock_id == stock_id).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found.")

    if stock not in portfolio.stocks:
        raise HTTPException(status_code=400, detail="Stock is not in portfolio.")

    portfolio.stocks.remove(stock)
    db.commit()
    db.refresh(portfolio)
    return portfolio

def get_portfolio_stocks(db: Session, portfolio_id: int) -> list[models.Stock]:
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.portfolio_id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    return portfolio.stocks

def get_threads(db: Session) -> list[models.Thread]:
    return (
        db.query(models.Thread)
        .all()
    )


# -----------------------------
# THREADS
# -----------------------------
def get_thread_by_id(db: Session, thread_id: int) -> models.Thread | None:
    return (
        db.query(models.Thread)
        .where(models.Thread.thread_id == thread_id)
        .first()
    )

def create_thread(db: Session, user_id: int, thread_name: str, stock_id: int) -> models.Thread:
    existing_thread = db.query(models.Thread).filter(models.Thread.creator_id == user_id, models.Thread.title == thread_name).first()
    if existing_thread:
        raise HTTPException(status_code=400, detail="Portfolio with this name already exists.")
    new_thread = models.Thread(creator_id=user_id, title=thread_name, stock_id=stock_id)
    db.add(new_thread)
    db.commit()
    db.refresh(new_thread)
    return new_thread

def get_thread_by_title_stock(db: Session, title: str, stock_id: int) -> models.Thread | None:
    return (
        db.query(models.Thread)
        .where(models.Thread.title == title)
        .where(models.Thread.stock_id == stock_id)
        .first()
    )
# ----------------------------
# NOTIFICATION CRUD
# ----------------------------

# Get all notifications for a user
def get_user_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    try:
        return db.query(models.Notification)\
            .filter(models.Notification.receiver_id == user_id)\
            .order_by(models.Notification.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

# Mark a notification as read with proper validation
def mark_notification_as_read(db: Session, notification_id: int):
    try:
        db_notification = db.query(models.Notification).filter(models.Notification.notification_id == notification_id).first()
        if not db_notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification with ID {notification_id} not found."
            )
            
        db_notification.is_read = True
        db.commit()
        db.refresh(db_notification)
        return db_notification
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

# Mark all notifications as read for a user with proper validation
def mark_all_notifications_as_read(db: Session, user_id: int):
    try:
        # Verify user exists first
        user = db.query(models.User).filter(models.User.user_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found."
            )
            
        db.query(models.Notification)\
            .filter(models.Notification.receiver_id == user_id, models.Notification.is_read == False)\
            .update({models.Notification.is_read: True})
        db.commit()
        return True
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

# top stocks function
def get_top_stocks(db: Session, limit: int = 20) -> list[models.Stock]:
    """
    Gets the top stocks with auto analysis mode, optionally limited to a specific count.
    Also enriches with latest sentiment data if available.
    """
    try:
        # Get stocks with auto analysis mode
        stocks = db.query(models.Stock).filter(
            models.Stock.analysis_mode == "auto"
        ).limit(limit).all()
        
        # Enhance stocks with sentiment data where available
        for stock in stocks:
            latest_sentiment = db.query(models.SentimentAnalysis)\
                .filter(models.SentimentAnalysis.stock_id == stock.stock_id)\
                .order_by(models.SentimentAnalysis.created_at.desc())\
                .first()
                
            if latest_sentiment:
                # Attach sentiment value to stock object
                stock.sentiment = latest_sentiment.sentiment_value
                
        return stocks
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error retrieving top stocks: {str(e)}"
        )
    
def create_notification(db: Session, sender_id: int, receiver_id: int, message: str, stock_id: int = None):
    """
    Create a new notification.
    
    Args:
        db: Database session
        sender_id: ID of the sender (system or user)
        receiver_id: ID of the user receiving the notification
        message: Notification message content
        stock_id: Optional related stock ID
    
    Returns:
        The created notification object
    """
    try:
        # Create notification instance
        new_notification = models.Notification(
            sender_id=sender_id,
            receiver_id=receiver_id,
            message=message,
            stock_id=stock_id,
            is_read=False,
            created_at=datetime.now()
        )
        
        # Add to database
        db.add(new_notification)
        db.commit()
        db.refresh(new_notification)
        return new_notification
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create notification: {str(e)}"
        )

# ----------------------------
# SENTIMENT CRUD
# ----------------------------

def get_sentiment_by_stock_id(db: Session, stock_id: int) -> models.SentimentAnalysis:
    return db.query(models.SentimentAnalysis).filter(models.SentimentAnalysis.stock_id == stock_id).order_by(models.SentimentAnalysis.created_at.desc()).first()

def get_last_n_sentiments_by_stock_id(db: Session, stock_id: int, n: int) -> list[dict]:
    results = (
        db.query(models.SentimentAnalysis)
        .filter(models.SentimentAnalysis.stock_id == stock_id)
        .order_by(models.SentimentAnalysis.created_at.desc())
        .limit(n)
        .all()
    )

    return [
        {
            "timestamp": sentiment.created_at,
            "value": sentiment.sentiment_value
        } for sentiment in results
    ]

    # Example output of get_last_n_sentiments_by_stock_id function:
    # [
    #   { "timestamp": "2024-04-01 10:00", "value": 2.5 },
    #   { "timestamp": "2024-04-01 11:00", "value": 3.0 },
    #   { "timestamp": "2024-04-01 12:00", "value": -1.0 }
    # ]


from sqlalchemy import func

def get_sentiment_summary_for_auto_stocks(db: Session) -> list[dict]:
    """
    Returns a summary of sentiment values for 'auto' stocks over time.
    Each entry represents a timestamp (grouped by hour) and the average sentiment value.
    """
    # Subquery: get stock_ids of auto-mode stocks
    auto_stock_ids = (
        db.query(models.Stock.stock_id)
        .filter(models.Stock.analysis_mode == "auto")
        .subquery()
    )

    results = (
        db.query(
            func.date_format(models.SentimentAnalysis.created_at, "%Y-%m-%d %H:00:00").label("timestamp"),
            func.avg(models.SentimentAnalysis.sentiment_value).label("value")
        )
        .filter(models.SentimentAnalysis.stock_id.in_(auto_stock_ids))
        .group_by(func.date_format(models.SentimentAnalysis.created_at, "%Y-%m-%d %H:00:00"))
        .order_by("timestamp")
        .all()
    )

    return [{"timestamp": row.timestamp, "value": row.value} for row in results]

    # Example output of get_sentiment_summary_for_auto_stocks function:
    # [
    #   { "timestamp": "2024-04-01 10:00", "value": 2.5 },
    #   { "timestamp": "2024-04-01 11:00", "value": 3.0 },
    #   { "timestamp": "2024-04-01 12:00", "value": -1.0 }
    # ]


def get_rolling_sentiment(db: Session, window_size: int = 3) -> list[dict]:
    """
    Returns rolling sentiment values for auto-mode stocks.
    Each result includes: stock_id, timestamp, and rolling_avg (calculated over the specified window_size).
    """
    subquery = (
        db.query(
            models.SentimentAnalysis.stock_id,
            models.SentimentAnalysis.sentiment_value,
            models.SentimentAnalysis.created_at,
            func.avg(models.SentimentAnalysis.sentiment_value)
                .over(
                    partition_by=models.SentimentAnalysis.stock_id,
                    order_by=models.SentimentAnalysis.created_at,
                    rows=window_size - 1
                ).label("rolling_avg")
        )
        .join(models.Stock, models.SentimentAnalysis.stock_id == models.Stock.stock_id)
        .filter(models.Stock.analysis_mode == "auto")
        .order_by(models.SentimentAnalysis.created_at)
        .subquery()
    )

    results = db.query(
        subquery.c.stock_id,
        subquery.c.created_at,
        subquery.c.rolling_avg
    ).all()

    return [
        {
            "stock_id": row.stock_id,
            "timestamp": row.created_at,
            "rolling_avg": row.rolling_avg
        } for row in results
    ]
    # Example output of get_rolling_sentiment function:
    # [
    #   { "stock_id": 1, "timestamp": "2024-04-01 10:00", "rolling_avg": 2.5 },
    #   { "stock_id": 1, "timestamp": "2024-04-01 11:00", "rolling_avg": 3.0 },
    #   { "stock_id": 2, "timestamp": "2024-04-01 10:00", "rolling_avg": -1.0 }
    # ]
    # Explanation:
    # - "stock_id": The ID of the stock for which the sentiment is calculated.
    # - "timestamp": The time at which the rolling average is computed.
    # - "rolling_avg": The average sentiment value over the specified window size.



def get_hybrid_rolling_sentiment(db: Session, window_size: int = 3) -> list[dict]:
    """
    Returns a rolling average sentiment across all 'auto' stocks over time.
    Groups sentiment values by hourly intervals and then calculates a rolling average over those hourly averages.
    """
    # 1. Get IDs of auto stocks
    auto_stock_ids = (
        db.query(models.Stock.stock_id)
        .filter(models.Stock.analysis_mode == "auto")
        .subquery()
    )

    # 2. Get all sentiment entries for those stocks, grouped by hour using MySQL's date_format
    sentiments = (
        db.query(
            func.date_format(models.SentimentAnalysis.created_at, "%Y-%m-%d %H:00:00").label("hour"),
            models.SentimentAnalysis.sentiment_value
        )
        .filter(models.SentimentAnalysis.stock_id.in_(auto_stock_ids))
        .order_by("hour")
        .all()
    )

    from collections import defaultdict, deque

    grouped = defaultdict(list)
    for row in sentiments:
        grouped[row.hour].append(row.sentiment_value)

    hours = sorted(grouped.keys())
    rolling_results = []
    rolling_window = deque(maxlen=window_size)

    for hour in hours:
        avg_this_hour = sum(grouped[hour]) / len(grouped[hour])
        rolling_window.append(avg_this_hour)
        rolling_avg = sum(rolling_window) / len(rolling_window)
        rolling_results.append({
            "timestamp": hour,
            "rolling_sentiment": round(rolling_avg, 3)
        })

    return rolling_results

    #######
    # Example output:
    # [
    # { "timestamp": "2024-04-01 10:00", "rolling_sentiment": 2.5 },
    # { "timestamp": "2024-04-01 11:00", "rolling_sentiment": 2.8 },
    # { "timestamp": "2024-04-01 12:00", "rolling_sentiment": 3.0 }
    # ]

def get_sentiment_summary_for_stock(db: Session, stock_id: int) -> list[dict]:
    results = (
        db.query(
            func.date_format(models.SentimentAnalysis.created_at, '%Y-%m-%d %H:00:00').label("timestamp"),
            func.avg(models.SentimentAnalysis.sentiment_value).label("value")
        )
        .filter(models.SentimentAnalysis.stock_id == stock_id)
        .group_by(func.date_format(models.SentimentAnalysis.created_at, '%Y-%m-%d %H:00:00'))
        .order_by("timestamp")
        .all()
    )

    return [{"timestamp": row.timestamp, "value": row.value} for row in results]

def get_sentiment_summary_for_stock_in_range(db: Session, stock_id: int, timeframe: str) -> list[dict]:
    """
    Returns average sentiment values for a stock in a given timeframe (e.g., '24h', '7d').
    """
    cutoff_time = parse_timeframe(timeframe)

    results = (
        db.query(
            func.date_format(models.SentimentAnalysis.created_at, "%Y-%m-%d %H:00:00").label("timestamp"),
            func.avg(models.SentimentAnalysis.sentiment_value).label("value")
        )
        .filter(models.SentimentAnalysis.stock_id == stock_id)
        .filter(models.SentimentAnalysis.created_at >= cutoff_time)
        .group_by(func.date_format(models.SentimentAnalysis.created_at, "%Y-%m-%d %H:00:00"))
        .order_by("timestamp")
        .all()
    )

    return [{"timestamp": row.timestamp, "value": row.value} for row in results]

        
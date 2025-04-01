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


# ----------------------------
#  POST CRUD
# ----------------------------
def create_post(db: Session, post_data: schemas.PostCreate):
    db_post = models.Post(**post_data.dict())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


def get_post_by_id(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.post_id == post_id).first()


def get_posts(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Post).offset(skip).limit(limit).all()


def update_post(db: Session, post_id: int, post_update: schemas.PostUpdate):
    db_post = db.query(models.Post).filter(models.Post.post_id == post_id).first()
    if not db_post:
        return None

    if post_update.title is not None:
        db_post.title = post_update.title
    if post_update.post_url is not None:
        db_post.post_url = post_update.post_url
    if post_update.content is not None:
        db_post.content = post_update.content

    db.commit()
    db.refresh(db_post)
    return db_post


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

# Create a new notification
def create_notification(db: Session, notification: schemas.NotificationCreate):
    db_notification = models.Notification(
        message=notification.message,
        sender_id=notification.sender_id,
        receiver_id=notification.receiver_id,
        created_at=datetime.now(),
        is_read=False
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

# Get all notifications for a user
def get_user_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Notification)\
        .filter(models.Notification.receiver_id == user_id)\
        .order_by(models.Notification.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

# Mark a notification as read
def mark_notification_as_read(db: Session, notification_id: int):
    db_notification = db.query(models.Notification).filter(models.Notification.notification_id == notification_id).first()
    if db_notification:
        db_notification.is_read = True
        db.commit()
        db.refresh(db_notification)
    return db_notification

# Mark all notifications as read for a user
def mark_all_notifications_as_read(db: Session, user_id: int):
    db.query(models.Notification)\
        .filter(models.Notification.receiver_id == user_id, models.Notification.is_read == False)\
        .update({models.Notification.is_read: True})
    db.commit()
    return True

# Create stock sentiment notifications
def create_stock_sentiment_notification(db: Session, user_id: int, system_user_id: int, stock_ticker: str, stock_name: str, old_sentiment: float, new_sentiment: float):
    change = new_sentiment - old_sentiment
    if abs(change) >= 2.0:  # Only notify if change is significant
        direction = "up" if change > 0 else "down"
        message = f"{stock_ticker} ({stock_name}) sentiment is {direction} by {abs(change):.1f}"
        
        notification = schemas.NotificationCreate(
            message=message,
            receiver_id=user_id,
            sender_id=system_user_id  # Using system user ID as sender
        )
        return create_notification(db, notification)
    return None

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

        
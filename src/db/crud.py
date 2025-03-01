from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from . import models, schemas
# ----------------------------
#  USER CRUD
# ----------------------------
def create_user(db: Session, user_data: schemas.UserCreate):
    db_user = models.User(
        name=user_data.name,
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
    return db.query(models.User).filter(models.User.name.like(f'%{name}%')).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        return None

    if user_update.name is not None:
        db_user.name = user_update.name
    if user_update.email is not None:
        db_user.email = user_update.email
    if user_update.password is not None:
        db_user.password = user_update.password

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
        name=stock_data.name,
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


def get_stocks(db: Session, skip: int = 0, limit: int = 100) -> list[models.Stock]:
    """Retrieve a list of stocks, with pagination."""
    return db.query(models.Stock).offset(skip).limit(limit).all()


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

    if stock_data.name is not None:
        stock.name = stock_data.name

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

# ----------------------------
#  STOCK CRUD
# ----------------------------

def create_portfolio(db: Session, user_id: int, portfolio_name: str) -> models.Portfolio:
    existing_portfolio = db.query(models.Portfolio).filter(models.Portfolio.user_id == user_id, models.Portfolio.name == portfolio_name).first()
    if (existing_portfolio):
        raise HTTPException(status_code=400, detail="Portfolio with this name already exists.")
    new_portfolio = models.Portfolio(user_id = user_id, name = portfolio_name)
    db.add(new_portfolio)
    db.commit()
    db.refresh(new_portfolio)
    return new_portfolio

def get_portfolio(db: Session, portfolio_id: int) -> models.Portfolio:
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.portfolio_id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    return portfolio

def get_portfolios_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> list[models.Portfolio]:
    return (
        db.query(models.Portfolio)
        .filter(models.Portfolio.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def update_portfolio(db: Session, portfolio_id: int, new_name: str) -> models.Portfolio:
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.portfolio_id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    portfolio.name = new_name
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
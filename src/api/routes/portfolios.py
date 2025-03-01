from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.db.database import get_db
from src.db import schemas
from src.db import crud

router = APIRouter(prefix="/portfolios", tags=["Portfolios"])

@router.post("/", response_model=schemas.PortfolioResponse)
def create_new_portfolio(
    portfolio: schemas.PortfolioCreate, 
    db: Session = Depends(get_db)
):
    # Placeholder: In a real app, get the current user from authentication
    user_id = 1  
    new_portfolio = crud.create_portfolio(db, user_id, portfolio.name)
    return new_portfolio

@router.get("/{portfolio_id}", response_model=schemas.PortfolioResponse)
def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = crud.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    return portfolio

@router.get("/user/{user_id}", response_model=List[schemas.PortfolioResponse])
def get_user_portfolios(
    user_id: int, 
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 100
):
    return crud.get_portfolios_by_user(db, user_id, skip, limit)

@router.put("/{portfolio_id}", response_model=schemas.PortfolioResponse)
def update_existing_portfolio(
    portfolio_id: int, 
    portfolio_update: schemas.PortfolioUpdate, 
    db: Session = Depends(get_db)
):
    if not portfolio_update.name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="A new portfolio name must be provided."
        )
    updated = crud.update_portfolio(db, portfolio_id, portfolio_update.name)
    return updated

@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    crud.delete_portfolio(db, portfolio_id)
    return

# Endpoint to add a stock to a portfolio
@router.post("/{portfolio_id}/stocks/{stock_id}", response_model=schemas.PortfolioResponse)
def add_stock_to_portfolio(
    portfolio_id: int, 
    stock_id: int, 
    db: Session = Depends(get_db)
):
    updated = crud.add_stock_to_portfolio(db, portfolio_id, stock_id)
    return updated

# Endpoint to remove a stock from a portfolio
@router.delete("/{portfolio_id}/stocks/{stock_id}", response_model=schemas.PortfolioResponse)
def remove_stock_from_portfolio(
    portfolio_id: int, 
    stock_id: int, 
    db: Session = Depends(get_db)
):
    updated = crud.remove_stock_from_portfolio(db, portfolio_id, stock_id)
    return updated

# Endpoint to get all stocks in a portfolio
@router.get("/{portfolio_id}/stocks", response_model=List[schemas.StockResponse])
def get_portfolio_stocks(portfolio_id: int, db: Session = Depends(get_db)):
    stocks = crud.get_portfolio_stocks(db, portfolio_id)
    return stocks
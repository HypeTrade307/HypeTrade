from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List

from src.db import models
from src.security import get_current_user  # This dependency decodes the JWT and returns the current user.
from src.db.database import get_db
from src.db import schemas
from src.db import crud
from src.processing import import_portfolio

router = APIRouter(prefix="/portfolios", tags=["Portfolios"])

@router.post("/", response_model=schemas.PortfolioResponse)
def create_new_portfolio(
    portfolio_data: schemas.PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # current_user is inferred from the token.
    new_portfolio = crud.create_portfolio(db, user_id=current_user.user_id, portfolio_name=portfolio_data.portfolio_name)
    return new_portfolio

@router.get("/{portfolio_id}", response_model=schemas.PortfolioResponse)
def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = crud.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    return portfolio

@router.get("/", response_model=List[schemas.PortfolioResponse])
def get_my_portfolios(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_portfolios_by_user(db, current_user.user_id)

@router.get("/user/{user_id}", response_model=List[schemas.PortfolioResponse])
def get_user_portfolios(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if the requested user exists
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Return portfolios for the specified user
    return crud.get_portfolios_by_user(db, user_id)

@router.put("/{portfolio_id}", response_model=schemas.PortfolioResponse)
def update_existing_portfolio(
    portfolio_id: int, 
    portfolio_update: schemas.PortfolioUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    portfolio = crud.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    if portfolio.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this portfolio.")
    if not portfolio_update.name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A new portfolio name must be provided.")
    updated = crud.update_portfolio(db, portfolio_id, portfolio_update.name)
    return updated

@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_portfolio(
    portfolio_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    portfolio = crud.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    if portfolio.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this portfolio.")
    crud.delete_portfolio(db, portfolio_id)
    return

@router.post("/{portfolio_id}/stocks/{stock_id}", response_model=schemas.PortfolioResponse)
def add_stock_to_portfolio(
    portfolio_id: int, 
    stock_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    portfolio = crud.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    if portfolio.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this portfolio.")
    updated = crud.add_stock_to_portfolio(db, portfolio_id, stock_id)
    return updated

@router.delete("/{portfolio_id}/stocks/{stock_id}", response_model=schemas.PortfolioResponse)
def remove_stock_from_portfolio(
    portfolio_id: int, 
    stock_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    portfolio = crud.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    if portfolio.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this portfolio.")
    updated = crud.remove_stock_from_portfolio(db, portfolio_id, stock_id)
    return updated

@router.get("/{portfolio_id}/stocks", response_model=List[schemas.StockBase])
def get_portfolio_stocks(portfolio_id: int, db: Session = Depends(get_db)):
    stocks = crud.get_portfolio_stocks(db, portfolio_id)
    return stocks

# Import portfolio from csv upload
@router.post("/{portfolio_id}/upload", response_model=schemas.PortfolioResponse)
async def import_stocks_to_portfolio(
        portfolio_id: int,
        file: UploadFile = File(...),
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user),
):
    portfolio = crud.get_portfolio(db, portfolio_id)

    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    if portfolio.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this portfolio.")

    updated_portfolio = import_portfolio.import_portfolio_from_csv(db, file.file, portfolio)
    return updated_portfolio
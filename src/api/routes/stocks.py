from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from src.db.database import get_db
from src.db.schemas import StockCreate, StockUpdate, StockResponse
from src.db.crud import (
    create_stock,
    get_stock,
    get_stocks,
    update_stock,
    delete_stock
)

router = APIRouter(prefix="/stocks", tags=["Stocks"])

@router.post("/", response_model=StockResponse)
def create_new_stock(stock_data: StockCreate, db: Session = Depends(get_db)):
    return create_stock(db, stock_data)

@router.get("/", response_model=List[StockResponse])
def read_all_stocks(db: Session = Depends(get_db)):
    return get_stocks(db)

@router.get("/{stock_id}", response_model=StockResponse)
def read_stock(stock_id: int, db: Session = Depends(get_db)):
    return get_stock(db, stock_id)

@router.put("/{stock_id}", response_model=StockResponse)
def modify_stock(stock_id: int, stock_data: StockUpdate, db: Session = Depends(get_db)):
    return update_stock(db, stock_id, stock_data)

@router.delete("/{stock_id}", status_code=204)
def remove_stock(stock_id: int, db: Session = Depends(get_db)):
    delete_stock(db, stock_id)
    return

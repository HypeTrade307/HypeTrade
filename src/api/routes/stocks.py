from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import random
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

@router.get("/sentiment/{stock_id}", response_model=List[float])
def get_stock_sentiment(stock_id: int, db: Session = Depends(get_db), interval: int = 1):
    # This is a placeholder function that returns random data, interval = 1 means 1 day
    # In a real application, you would fetch data from a database or API
    interval = interval * 24
    return [round(random.uniform(-10, 10), 3) for _ in range(int(interval / 12))]

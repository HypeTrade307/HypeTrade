from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, func
from sqlalchemy.orm import Session
from typing import List
import random
import os
import json
from src.db.database import get_db
from src.db import models
from pathlib import Path 
from src.db.schemas import StockCreate, StockUpdate, StockResponse
from src.db.crud import (
    create_stock,
    get_stock,
    get_stocks,
    update_stock,
    delete_stock
)

router = APIRouter(prefix="/stocks", tags=["Stocks"])




@router.get("/top-sentiment")
def get_top_sentiment_stocks(limit: int = 100, db: Session = Depends(get_db)):
    """
    Returns the top stocks sorted by absolute latest_sentiment_value.
    Used for the heatmap.
    """
    stocks = (
        db.query(models.Stock)
        .filter(models.Stock.latest_sentiment_value.isnot(None))
        .order_by(func.abs(models.Stock.latest_sentiment_value).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "name": stock.ticker,  # or stock.name, depending on your UI
            "size": stock.latest_sentiment_value
        }
        for stock in stocks
    ]

@router.post("/refresh-static")
def refresh_static_data(db: Session = Depends(get_db)):
    # 1) Pull top 6 sentiments
    try:
        stocks = (
            db.query(models.Stock)
              .filter(models.Stock.latest_sentiment_value.isnot(None))
              .order_by(func.abs(models.Stock.latest_sentiment_value).desc())
              .limit(6)
              .all()
        )
    except Exception as e:
        raise HTTPException(500, f"DB query failed: {e}")

    payload = [{"name": s.ticker, "size": s.latest_sentiment_value} for s in stocks]

    # 2) Build the path to Hypetrade307/public/data2.json
    project_root = Path(__file__).resolve().parents[3]
    public_dir   = project_root / "Hypetrade307" / "public"
    outpath      = public_dir / "data2.json"

    os.makedirs(public_dir, exist_ok=True)
    to_dump = [{**item, "value": abs(item["size"])} for item in payload]
    outpath.write_text(json.dumps(to_dump, indent=2), encoding="utf-8")


    try:
        public_dir.mkdir(parents=True, exist_ok=True)
        # include value if your frontend expects it:
        to_dump = [{**item, "value": abs(item["size"])} for item in payload]
        outpath.write_text(json.dumps(to_dump, indent=2), encoding="utf-8")
    except Exception as e:
        raise HTTPException(500, f"Failed writing {outpath}: {e}")

    return {"status": "ok", "written": len(payload), "path": str(outpath)}


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

@router.get("/top/", response_model=List[StockResponse])
def get_top_stocks(limit: int = 20, db: Session = Depends(get_db)):
    """
    Returns top stocks with analysis_mode='auto', limited by the parameter
    """
    # Query stocks with analysis_mode='auto'
    stocks = db.query(models.Stock).filter(
        models.Stock.analysis_mode == "auto"

        # we can switch this to sentiment val or market later...
    ).limit(limit).all()
    
    if not stocks:
        # If no stocks are found, you might need to seed the database
        raise HTTPException(status_code=404, detail="No auto-analyzed stocks found. Database may need seeding.")
    
    return stocks

# SEARCH FUNCTIONALITY!

@router.get("/search", response_model=List[StockResponse])
def search_stocks(
    query: str,
    db: Session = Depends(get_db)
):
    """
    Search for stocks by symbol or name.
    The search is case-insensitive and matches partial strings.
    """
    # Convert query to lowercase for case-insensitive search
    search_query = f"%{query.lower()}%"
    
    # Search in both symbol and name fields
    stocks = db.query(models.Stock).filter(
        or_(
            models.Stock.symbol.ilike(search_query),
            models.Stock.name.ilike(search_query)
        )
    ).all()
    
    return stocks



@router.get("/{ticker}/id")
def get_stock_id_by_ticker(ticker: str, db: Session = Depends(get_db)):
    """
    Returns the stock_id given a ticker symbol (case-insensitive).
    """
    stock = db.query(models.Stock).filter(models.Stock.ticker.ilike(ticker)).first()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock with ticker '{ticker}' not found.")
    return {"stock_id": stock.stock_id}


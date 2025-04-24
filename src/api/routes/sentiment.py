from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.db import crud, schemas
from src.db.database import get_db
from src.processing import scraping, sentiment_analysis

router = APIRouter(prefix="/specific-stock", tags=["Sentiment"])

@router.post("/request")
def request_sentiment_analysis(request: schemas.SentimentRequest, db: Session = Depends(get_db)):
    """
    Request sentiment analysis for a given text.
    """
    # Validate the input text
    print("Requesting sentiment analysis for ticker:", request.ticker)
    if not request.ticker:
        raise HTTPException(status_code=400, detail="Ticker is required for sentiment analysis.")
    
    # Perform sentiment analysis using your existing function
    sentiment_analysis.requested_update(db, request.ticker, request.stock_id)

@router.get("/summary/all", response_model=list[dict])
def get_sentiment_summary_for_all(db: Session = Depends(get_db)):
    """
    Fetch all sentiment analysis data.
    """
    sentiment_data = crud.get_sentiment_summary_for_auto_stocks(db)
    if not sentiment_data:
        raise HTTPException(status_code=404, detail="No sentiment data found.")
    
    return sentiment_data

@router.get("/summary/{stock_id}", response_model=list[dict])
def get_sentiment_summary_for_stock(stock_id: int, db: Session = Depends(get_db)):
    """
    Fetch sentiment analysis summary for a specific stock ID.
    """
    sentiment_data = crud.get_sentiment_summary_for_stock(db, stock_id)
    if not sentiment_data:
        raise HTTPException(status_code=404, detail="No sentiment data found for this stock.")
    
    return sentiment_data

@router.get("/summary/{timeframe}/{stock_id}", response_model=list[dict])
def get_sentiment_summary_for_stock_by_timeframe(stock_id: int, timeframe: str, db: Session = Depends(get_db)):
    """
    Fetch sentiment analysis summary for a specific stock ID and timeframe.
    """
    sentiment_data = crud.get_sentiment_summary_for_stock_in_range(db, stock_id, timeframe)
    if not sentiment_data:
        raise HTTPException(status_code=404, detail="No sentiment data found for this stock.")
    
    return sentiment_data


@router.put("/update/{stock_id}")
def update_sentiment(stock_id: int, db: Session = Depends(get_db)):
    """
    Update sentiment analysis for a specific stock ID.
    """
    scraping.process_unprocessed_entries(db, stock_id)
    return {"message": "Sentiment analysis updated successfully."}


@router.get("/{stock_id}", response_model=list[dict])
def get_last_n_sentiment(stock_id: int, n: int,db: Session = Depends(get_db)):
    """
    Fetch sentiment analysis for a given stock ID.
    """
    sentiment_data = crud.get_last_n_sentiments_by_stock_id(db, stock_id, n)
    # if not sentiment_data:
    #     raise HTTPException(status_code=404, detail="No sentiment data found for this stock.")
    
    return sentiment_data
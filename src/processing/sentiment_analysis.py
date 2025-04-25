from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import src.processing.scraping as scraping
import src.db.models
import datetime
import src.db.schemas
from src.db import crud
from src.db.database import get_db

router = APIRouter(prefix="/scraping", tags=["Scraping"])

SUBREDDITS = ["stocks", "investing", "wallstreetbets", "stockmarket", "investor"]
 # returns a list of models.Stock, which have attributes stock_id

def periodical_update(db: Session):
    """
    Periodically updates the database with new Reddit posts.
    """
    STOCKS = crud.get_top_stocks(db)
    for STOCK in STOCKS:
        stock_id = STOCK.stock_id
        keyword = STOCK.ticker
        for SUBREDDIT in SUBREDDITS:
            scraping.scrape_subreddit_posts(db, SUBREDDIT, keyword, stock_id, limit=50)
        scraping.process_unprocessed_entries(db, stock_id)

@router.get("/", tags=["scraping"])
def trigger_periodical_update(db: Session = Depends(get_db)):
    """
    Triggers the periodical_update function via an HTTP GET request.
    """
    periodical_update(db)
    return {"message": "Scraping and sentiment update completed for top stocks."}


def requested_update(db: Session, keyword: str, stock_id: int):
    for SUBREDDIT in SUBREDDITS:
        # Scrape the subreddit for posts containing the keyword
        scraping.scrape_subreddit_posts(db, SUBREDDIT, keyword, stock_id, limit=50)
    scraping.process_unprocessed_entries(db, stock_id)

# periodical_update(db=db)
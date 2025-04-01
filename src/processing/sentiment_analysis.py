import src.processing.scraping as scraping
import src.db.models
import datetime
import src.db.schemas
from src.db import crud
import src.db.database
from sqlalchemy.orm import Session

db=src.db.database.SessionLocal()
SUBREDDITS=["stocks", "investing", "wallstreetbets", "stockmarket", "investor"]
STOCKS=crud.get_top_stocks(db)  # Assuming you have a function to get top stocks

def periodical_update(db: Session, subreddit_name: str, keyword: str, stock_id: int = None):
    """ 
    Periodically updates the database with new Reddit posts.
    """
    # Scrape new posts
    for STOCK in STOCKS:
        for SUBREDDIT in SUBREDDITS:
            stock_id = STOCK.id
            keyword = STOCK.ticker
            # Scrape the subreddit for posts containing the keyword
            scraping.scrape_subreddit_posts(db, subreddit_name, keyword, stock_id, limit=50)
        scraping.process_unprocessed_entries(db, stock_id)

def requested_update(db: Session, keyword: str, stock_id: int):
    for SUBREDDIT in SUBREDDITS:
        # Scrape the subreddit for posts containing the keyword
        scraping.scrape_subreddit_posts(db, SUBREDDIT, keyword, stock_id, limit=50)
    scraping.process_unprocessed_entries(db, stock_id)














import src.processing.scraping as scraping
import src.db.models
import datetime
import src.db.schemas
from src.db import crud
import src.db.database
from sqlalchemy.orm import Session

db=src.db.database.SessionLocal()
SUBREDDITS=["stocks", "investing", "wallstreetbets", "stockmarket", "investor"]
STOCKS=crud.get_top_stocks(db)  # returns a list of models.Stock, which have attributes stock_id

def periodical_update(db: Session):
    """
    Periodically updates the database with new Reddit posts.
    """
    # Scrape new posts
    for STOCK in STOCKS:
        stock_id = STOCK.stock_id
        keyword = STOCK.ticker
        for SUBREDDIT in SUBREDDITS:
            # Scrape the subreddit for posts containing the keyword
            scraping.scrape_subreddit_posts(db, SUBREDDIT, keyword, stock_id, limit=50)
        scraping.process_unprocessed_entries(db, stock_id)

def requested_update(db: Session, keyword: str, stock_id: int):
    for SUBREDDIT in SUBREDDITS:
        # Scrape the subreddit for posts containing the keyword
        scraping.scrape_subreddit_posts(db, SUBREDDIT, keyword, stock_id, limit=50)
    scraping.process_unprocessed_entries(db, stock_id)

# periodical_update(db=db)













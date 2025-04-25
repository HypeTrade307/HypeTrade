# reddit_scraper.py
import datetime
import os
import re
from time import sleep

import dotenv
# If you want to use PRAW:
import praw
from flask.cli import load_dotenv
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from services.models_requests import get_financial_sentiment
# Import your DB models and session
from src.db.database import SessionLocal
from src.db import models
from src.db.models import scraped_reddit_entries
# Example: from huggingface or your pipeline
# from src.sentiment.finbert import run_finbert_sentiment

#############################
# 1) SET UP REDDIT SCRAPER #
#############################
def get_reddit_instance() -> praw.Reddit:
    """
    Returns a configured PRAW Reddit instance using your app credentials.
    """
    load_dotenv()
    reddit = praw.Reddit(
        client_id=os.getenv("REDDIT_CLIENT"),  # from the top under "web app"
        client_secret=os.getenv("REDDIT_SECRET"),  # shown next to "secret"
        user_agent="HypeTradeApp/1.0 by us",  # descriptive user agent
    )
    return reddit


#############################
# 2) SCRAPE A SUBREDDIT    #
#############################
def scrape_subreddit_posts(db: Session, subreddit_name: str, keyword: str, stock_id: int, limit: int = 20):
    """
    Scrapes the given subreddit for posts containing the keyword in title/selftext.
    If stock_id is provided, we link each scraped post to that Stock.
    This is a naive approach. 
    """
    reddit = get_reddit_instance()
    subreddit = reddit.subreddit(subreddit_name)
    # Simple approach: search() or new/hot. Let's do a search by keyword
    # For advanced usage, see PRAW docs for more methods (e.g. new, hot, etc.).
    search_res = subreddit.search(keyword, sort="new", limit=3)
    for submission in search_res:
        # Check if we already have this post in DB
        existing = db.query(scraped_reddit_entries).filter_by(reddit_id=f"t3_{submission.id}").first()
        if existing:
            continue

        # Create new ScrapedRedditEntry
        new_entry = scraped_reddit_entries(
            reddit_id=f"t3_{submission.id}",
            is_comment=False,
            parent_reddit_id=None,
            subreddit=submission.subreddit.display_name,
            author=str(submission.author) if submission.author else None,
            title=submission.title,
            content=submission.selftext,
            score=submission.score,
            url=submission.url,
            created_utc=datetime.datetime.utcfromtimestamp(submission.created_utc),
            created_at=datetime.datetime.utcnow(),
        )
        # If you want to store multiple stock mentions, you could parse the text for more tickers
        # but for now, we just link to the single "stock_id" if provided
        db.add(new_entry)
        db.flush()  # Ensure the entry is added before linking
        if stock_id:
            stock_obj = db.query(models.Stock).filter(models.Stock.stock_id == stock_id).first()
            if stock_obj:
                new_entry.mentioned_stocks.append(stock_obj)

        try:
            db.commit()
        except IntegrityError:
            print("IntegrityError")
            db.rollback()
        sleep(1)


#############################
# 3) SCRAPE COMMENTS       #
#############################
def scrape_comments_for_post(db: Session, submission_id: str, stock_id: int = None):
    """
    Example of scraping comments for a single post (submission).
    You might integrate this logic above if you want to handle comments in the same pass.
    """
    reddit = get_reddit_instance()
    submission = reddit.submission(id=submission_id)  # e.g. submission_id = "abc123"

    submission.comments.replace_more(limit=0)  # Flatten comment trees
    for comment in submission.comments.list():
        # Check if we have it
        existing = db.query(scraped_reddit_entries).filter_by(reddit_id=f"t1_{comment.id}").first()
        if existing:
            continue

        new_entry = scraped_reddit_entries(
            reddit_id=f"t1_{comment.id}",
            is_comment=True,
            parent_reddit_id=f"t3_{submission_id}",  # or comment.parent_id
            subreddit=submission.subreddit.display_name,
            author=str(comment.author) if comment.author else None,
            title=None,
            content=comment.body,
            score=comment.score,
            url=comment.permalink,
            created_utc=datetime.datetime.utcfromtimestamp(comment.created_utc),
        )

        if stock_id:
            stock_obj = db.query(models.Stock).filter(models.Stock.stock_id == stock_id).first()
            if stock_obj:
                new_entry.mentioned_stocks.append(stock_obj)

        db.add(new_entry)

    db.commit()


#############################
# 4) PROCESS (FINBERT)     # PLACEHOLDER, JUST FOR AESTHETIC(???)
#############################
def process_unprocessed_entries(db: Session, stock_id: int):
    """
    1) Finds 'unprocessed' ScrapedRedditEntry rows that mention this stock
    2) Runs sentiment analysis (placeholder or real FinBERT)
    3) Stores each result in 'sentiment_analysis' (or updates stock table)
    4) Marks them as processed
    """
    unprocessed_entries = (
        db.query(scraped_reddit_entries)
        .join(models.scrapedentry_stocks, models.scrapedentry_stocks.c.entry_id == scraped_reddit_entries.entry_id)
        .filter(models.scrapedentry_stocks.c.stock_id == stock_id)
        # .filter(scraped_reddit_entries.processed_at.is_(None))
        .all()
    )
    # print("length is {}".format(len(unprocessed_entries)))
    texts:list[str] = [(entry.title + " " + (entry.content or "")) for entry in unprocessed_entries]
    # values = get_financial_sentiment(texts) #call fn w texts as variable
    for i in range(len(unprocessed_entries) - 1):
        entry = unprocessed_entries[i]
    # for-loop through entry
        # Suppose we have a placeholder function that returns a sentiment float
        # sentiment_score = run_finbert_sentiment(entry.title + " " + (entry.content or ""))
        # print("Processing entry: ", entry.reddit_id)
        # print("Content: ", entry.content)
        sentiment_score = get_financial_sentiment(entry.content)
        # print("Sentiment score: ", sentiment_score)
        # Insert a row in 'sentiment_analysis'
        sentiment_row = models.SentimentAnalysis(
            stock_id=stock_id,
            entry_id=entry.entry_id,
            sentiment_value=sentiment_score,
            raw_string=None,  # optional, or store the text snippet
        )
        db.add(sentiment_row)

        # Mark the entry as processed
        entry.processed_at = datetime.datetime.utcnow()

    db.commit()

# Just a stub for demonstration
def fake_sentiment(entry: scraped_reddit_entries) -> float:
    """
    A fake function that returns a random sentiment in [-10, 10].
    Replace with your FinBERT pipeline or other real logic.
    """
    content = f"Subreddit: {entry.subreddit}, Title: {entry.title}\nContent: {entry.content}"
    return get_financial_sentiment(content)
    # import random
    # return round(random.uniform(-10.0, 10.0), 2)

def check_reddit_connection():
    reddit = get_reddit_instance()
    me = reddit.read_only  # should be True
    print("PRAW connection is working. Read-only:", me)
# #############################
# # 5) FULL EXAMPLE RUN      #
# #############################
# if __name__ == "__main__":
#     # Start a DB session
#     db = SessionLocal()
#     print(1)

#     # Suppose we have a Stock row for AMD with stock_id=42
#     # 1) Scrape the 'stocks' subreddit for 'AMD' keyword
#     scrape_subreddit_posts(db, "stocks", "AMD", stock_id=42)
    # print(2)

#     # 2) For each new post, also scrape comments if you want
#     # You can find the new posts in the DB or from PRAW
#     # Example: comment out or adapt
    # scrape_comments_for_post(db, "abc123", stock_id=42)

#     # 3) Now run the processing function to mark them as processed & store sentiment
#     process_unprocessed_entries(db, stock_id=42)
#     print(3)

    # db.close()

def parse_timeframe(timeframe: str) -> datetime:
    """
    Converts a timeframe string (like '24h', '7d') into a datetime object.
    """
    now = datetime.utcnow()
    if timeframe.endswith("h"):
        return now - datetime.timedelta(hours=int(timeframe[:-1]))
    elif timeframe.endswith("d"):
        return now - datetime.timedelta(days=int(timeframe[:-1]))
    else:
        raise ValueError("Invalid timeframe format. Use '24h', '7d', or '30d'.")

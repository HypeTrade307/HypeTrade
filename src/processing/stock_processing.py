from sqlalchemy.orm import Session
from src.db import models
import pandas as pd

WIKI_SP500_URL = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"

TOP_20_TICKERS = {
  "AAPL", "MSFT", "AMZN", "NVDA", "GOOGL", "GOOG", "TSLA", "META",
  "BRK.B", "V", "UNH", "JNJ", "WMT", "XOM", "JPM", "MA", "PG", "HD",
  "CVX", "ABBV"
}

def fetch_sp500_from_wikipedia() -> pd.DataFrame:
    """
    Scrapes the S&P 500 listing from Wikipedia using pandas read_html.
    Returns a DataFrame with at least 'Symbol' and 'Security'.
    """
    tables = pd.read_html(WIKI_SP500_URL)
    # The first table on the page typically contains the listing
    # but verify if you see multiple tables
    sp500_table = tables[0]

    # Usually, the columns are "Symbol", "Security", etc.
    # But always confirm the actual column names in the DataFrame
    df = sp500_table[["Symbol", "Security"]].copy()
    # Clean up any weird formatting
    df["Symbol"] = df["Symbol"].str.replace(".", "-", regex=False)  # e.g. "BRK.B" => "BRK-B" if needed
    return df

def get_stock_lists_from_sp500() -> tuple[list[dict], list[dict]]:
    """
    Returns two lists of dicts:
      1. top_20_stocks -> with 'analysis_mode' set to 'auto'
      2. remaining_480_stocks -> 'analysis_mode' = 'on_demand'
    """
    df = fetch_sp500_from_wikipedia()  # DataFrame with 'Symbol', 'Security'
    # Convert DataFrame rows into list of dicts
    all_stocks = df.to_dict("records")

    top_20_stocks = []
    remaining_stocks = []

    for row in all_stocks:
        ticker = row["Symbol"]
        company_name = row["Security"]

        if ticker in TOP_20_TICKERS:
            top_20_stocks.append({"ticker": ticker, "stock_name": company_name, "analysis_mode": "auto"})
        else:
            remaining_stocks.append({"ticker": ticker, "stock_name": company_name, "analysis_mode": "on_demand"})

    return top_20_stocks, remaining_stocks

def seed_stocks(db: Session):
    top_20_stocks, remaining_stocks = get_stock_lists_from_sp500()
    # Insert or update top 20 stocks
    for stock_dict in top_20_stocks:
        existing = db.query(models.Stock).filter(models.Stock.ticker == stock_dict["ticker"]).first()
        if existing:
            if existing.analysis_mode is None:
                existing.analysis_mode = stock_dict["analysis_mode"]
        else:
            new_stock = models.Stock(
                ticker=stock_dict["ticker"],
                stock_name=stock_dict["stock_name"],
                analysis_mode=stock_dict["analysis_mode"]
            )
            db.add(new_stock)
    # Insert or update remaining stocks
    for stock_dict in remaining_stocks:
        existing = db.query(models.Stock).filter(models.Stock.ticker == stock_dict["ticker"]).first()
        if existing:
            if existing.analysis_mode is None:
                existing.analysis_mode = stock_dict["analysis_mode"]
        else:
            new_stock = models.Stock(
                ticker=stock_dict["ticker"],
                stock_name=stock_dict["stock_name"],
                analysis_mode=stock_dict["analysis_mode"]
            )
            db.add(new_stock)
    db.commit()

from sqlalchemy.orm import Session
from src.db import models
from src.db import crud
import pandas as pd

def import_portfolio_from_csv(db: Session, file, portfolio):

    port_import_table = pd.read_csv(file)
    print(port_import_table)

    df = port_import_table[["Ticker", "Name"]].copy()

    # Clean up any weird formatting
    df["Ticker"] = df["Ticker"].str.replace(".", "-", regex=False)  # e.g. "BRK.B" => "BRK-B" if needed

    stock_list = df.to_dict(orient='records')
    import_stock_list = []

    for row in stock_list:
        ticker = row["Ticker"]
        company_name = row["Name"]
        import_stock_list.append({"ticker": ticker, "stock_name": company_name})

    existing_port_stocks = crud.get_portfolio_stocks(db, portfolio.portfolio_id)
    existing_port_stocks_tickers = []

    for stock in existing_port_stocks:
        existing_port_stocks_tickers.append(stock.ticker)
        print("Ignore existing stock: " + stock.ticker + " - " + stock.stock_name)

    # Only add stocks that are not already in the portfolio in question
    for stock_dict in import_stock_list:

        # If the ticker does not exist in current portfolio
        if stock_dict.get("ticker") not in existing_port_stocks_tickers:

            # Check to see if the stock to add exists is valid
            valid_stock = db.query(models.Stock).filter(models.Stock.ticker == stock_dict["ticker"]).first()
            if valid_stock:
                print("Add valid stock: " + valid_stock.ticker + " - " + valid_stock.stock_name)
                portfolio.stocks.append(valid_stock)

    db.commit()
    db.refresh(portfolio)
    return portfolio
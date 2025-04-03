import yfinance as yf
import json
import pandas as pd
// pip lxml pandas yfinance
def get_top_20_valued_stocks():
    # Fetch S&P 500 tickers dynamically
    sp500_tickers = pd.read_html("https://en.wikipedia.org/wiki/List_of_S%26P_500_companies")[0]['Symbol'].tolist()

    stock_data = []

    # Fetch market cap for all S&P 500 stocks
    market_caps = {}
    for ticker in sp500_tickers:
        try:
            stock = yf.Ticker(ticker)
            market_cap = stock.info.get("marketCap", 0)  # Default to 0 if not found
            market_caps[ticker] = market_cap

        except Exception as e:
            print(f"Error fetching data for {ticker}: {e}")

    # Sort tickers by market cap and take the top 20
    top_20_tickers = sorted(market_caps, key=market_caps.get, reverse=True)[:20]

    # Create a list of dictionaries with only ticker and sentiment
    stock_data = [{"ticker": ticker, "sentiment": 0} for ticker in top_20_tickers]

    # Save results to a JSON file
    with open("data/top_20_stocks.json", "w") as file:
        json.dump(stock_data, file, indent=2)

    print("Top 20 stocks saved to data/top_20_stocks.json")

# Run the function
get_top_20_valued_stocks()

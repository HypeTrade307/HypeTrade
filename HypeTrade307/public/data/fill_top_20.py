import yfinance as yf
import json

# Load the top 20 most valued stocks from the JSON file
with open("top_20_stocks.json", "r") as file:
    top_stocks = json.load(file)

# Function to fetch historical data for a given stock
def fetch_stock_history(stock_symbol):
    stock = yf.Ticker(stock_symbol)

    # Get historical market data for the past month
    history = stock.history(period="1mo")

    # Convert to a list of dictionaries with only date and close price
    data = [
        {"name": str(index.date()), "value": int(row["Close"])}
        for index, row in history.iterrows()
    ]

    # Save to a separate JSON file for each stock
    with open(f"{stock_symbol}_history.json", "w") as file:
        json.dump(data, file, indent=2)

    print(f"Stock price history for {stock_symbol} saved to {stock_symbol}_history.json")

# Loop through each stock in the top_20_stocks.json and fetch historical data
for stock in top_stocks:
    stock_symbol = stock["ticker"]
    fetch_stock_history(stock_symbol)

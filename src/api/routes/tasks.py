from random import random

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.crud import get_users, get_top_stocks_changes, get_top_stocks, get_portfolios_by_user
from services.email_send import send_simple_message
from src.db.database import get_db

router = APIRouter(prefix="/tasks", tags=["Portfolios"])

@router.get("/", tags=["tasks"])
def trigger_daily_digest(db: Session = Depends(get_db)):
    send_simple_message("adityagandhi98101@gmail.com", "running the thing step 1")
    users = get_users(db)
    for i in users: print(i)
    stock_changes = get_top_stocks_changes(db)
    top_stocks = get_top_stocks(db)
    for i in stock_changes: print(i)
    # print("stock changes: {stock_changes}".format(stock_changes=stock_changes))

    content = """Changes for the top 20 stocks over the last day:\n"""
    for st in stock_changes:
        if st['sentiment_change'] == 0: content += f"""{st['ticker']}:{round(random(), 2)}\n"""
        else: content += f"""{st['ticker']}:{st['sentiment_change']}\n"""
    for user in users:
        if user.email != "adityagandhi98101@gmail.com" and user.email != "hypetrademail@gmail.com":
            print(f"skipping for {user.email}")
        else:
            print(f"sending email to {user.email}")
        newcontent = content + f"""\nChanges for your portfolios:\n"""
        portfolios = get_portfolios_by_user(db, user.user_id)
        for p in portfolios:
            print(p.portfolio_name)
        if len(portfolios) == 0:
            print(f"portfolio not found for {user.email}")
        for portfolio in portfolios:
            if len(portfolio.stocks) == 0:
                print(f"no stock in {portfolio.portfolio_name} for {user.email}")
            newcontent += f"""Portfolio: {portfolio.portfolio_name}\n"""
            for stock in portfolio.stocks:
                if stock in top_stocks:
                    print(f"{stock}: included in top 20")
                newcontent += f"""{stock.ticker}:{round(random(), 2)}\n"""
        send_simple_message(user.email, newcontent)
        print(user.email)
    print("daily trigger done successfully.")
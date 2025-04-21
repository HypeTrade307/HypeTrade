from src.db.database import get_db, SessionLocal
from fastapi import Depends
from sqlalchemy.orm import Session
from src.db.crud import get_users, get_top_stocks
from src.db.crud import get_top_stocks_changes
from src.services.email_send import send_simple_message
from src.db.crud import get_portfolios_by_user
from random import random

def run_daily_digest(db):
    """
    logic: gather stock changes for top 20 stocks --> create a for loop for each user --> gather portfolios for
    each user --> gather changes for each stock on each portfolio --> duplicate content, add p_changes to
    --> send emails individually
    :param db:
    :return:
    """
    db: Session = db
    try:
        users = get_users(db, limit=100)
        # print("users: {users}".format(users=users))
        stock_changes = get_top_stocks_changes(db)
        top_stocks = get_top_stocks(db)
        # for i in stock_changes: print(i)
        # print("stock changes: {stock_changes}".format(stock_changes=stock_changes))

        content = """Changes for the top 20 stocks over the last day:\n"""
        for st in stock_changes:
            content += f"""{st['ticker']}:{st['sentiment_change']}\n"""
        for user in users:
            newcontent = content + f"""\nChanges for your portfolios:\n"""
            portfolios = get_portfolios_by_user(db, user.user_id)
            if len(portfolios) == 0: continue
            for portfolio in portfolios:
                newcontent += f"""Portfolio: {portfolio.portfolio_name}\n"""
                for stock in portfolio.stocks:
                    if stock in top_stocks: continue
                    newcontent += f"""{stock.ticker}:{round(random(), 2)}\n"""
            send_simple_message(user.email, newcontent)
            print(user.email)
    finally:
        db.close()

run_daily_digest(db=SessionLocal())
from fastapi import FastAPI
from src.db.database import SessionLocal, engine, Base
from src.api.routes.users import router as users_router
from src.api.routes.stocks import router as stocks_router
from src.api.routes.portfolios import router as portfolio_router
from src.processing.stock_processing import seed_stocks

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# @app.on_event("startup")
# def on_startup():
#     with SessionLocal() as db:
#         seed_stocks(db)
seed_stocks(db=SessionLocal())
# Include routers
app.include_router(users_router)
app.include_router(stocks_router)
app.include_router(portfolio_router)

@app.get("/")
def root():
    return {"message": "Welcome to the Stocks Social Media API!"}

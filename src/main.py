from fastapi import FastAPI
from src.db.database import SessionLocal, engine, Base
from src.api.routes.users import router as users_router
from src.api.routes.stocks import router as stocks_router
from src.api.routes.portfolios import router as portfolio_router
from src.api.routes.auth import router as auth_router
from src.processing.stock_processing import seed_stocks
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# @app.on_event("startup")
# def on_startup():
#     with SessionLocal() as db:
#         seed_stocks(db)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL for security (e.g., "http://localhost:3000")
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # Allows all headers
)
seed_stocks(db=SessionLocal())
# Include routers
app.include_router(users_router)
app.include_router(stocks_router)
app.include_router(portfolio_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Welcome to the Stocks Social Media API!"}

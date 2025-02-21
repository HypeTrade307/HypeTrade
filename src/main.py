from fastapi import FastAPI
from src.db.database import engine, Base
from src.api.routes.users import router as users_router

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(users_router)

@app.get("/")
def root():
    return {"message": "Welcome to the Stocks Social Media API!"}

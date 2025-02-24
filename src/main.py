from fastapi import FastAPI
from src.db.database import engine, Base
from src.api.routes.users import router as users_router
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

app = FastAPI()

# # Create tables
# Base.metadata.create_all(bind=engine)

# # Include routers
# app.include_router(users_router)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))  # cloud run requires PORT env var
    uvicorn.run(app, host="0.0.0.0", port=port)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "Welcome to the Stocks Social Media API!"}


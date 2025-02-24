from fastapi import FastAPI
from src.db.database import engine, Base
from src.api.routes.users import router as users_router
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# serve react's built files
app.mount("/", StaticFiles(directory="dist", html=True), name="frontend")

# Create tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(users_router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "Welcome to the Stocks Social Media API!"}



from fastapi import FastAPI
from database import engine, Base
from routes import users, posts

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(users.router)
app.include_router(posts.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Stocks Social Media API!"}

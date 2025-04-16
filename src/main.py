from fastapi import FastAPI
import uvicorn
from src.db.database import SessionLocal, engine, Base
from src.api.routes.notifications import router as notification_router
from src.api.routes.users import router as users_router
from src.api.routes.stocks import router as stocks_router
from src.api.routes.portfolios import router as portfolio_router
from src.api.routes.forum import router as forum_router
from src.api.routes.auth import router as auth_router
from src.api.routes.sentiment import router as sentiment_router
from src.api.routes.threads import router as threads_router
from src.api.routes.posts import router as posts_router, comment_router
from src.processing.stock_processing import seed_stocks
from src.processing import scraping as sc
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))  # add src to path
app = FastAPI()
Base.metadata.create_all(bind=engine)
sc.test_reddit_connection()

# Add origins for both development and production
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # For production with Cloud Run
    "https://*.run.app",
    # Add your custom domain if you have one
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)
seed_stocks(db=SessionLocal())

# Include all routers
app.include_router(users_router, prefix="/api")
app.include_router(threads_router, prefix="/api")
app.include_router(stocks_router, prefix="/api")
app.include_router(portfolio_router, prefix="/api")
app.include_router(forum_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(notification_router, prefix="/api")
app.include_router(sentiment_router, prefix="/api")
app.include_router(posts_router, prefix="/api")
app.include_router(comment_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Serve the frontend static files in production
if os.path.exists('/app/HypeTrade307/dist'):
    app.mount("/", StaticFiles(directory="/app/HypeTrade307/dist", html=True), name="frontend")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if os.path.exists(f"/app/HypeTrade307/dist/{full_path}"):
            return FileResponse(f"/app/HypeTrade307/dist/{full_path}")
        return FileResponse("/app/HypeTrade307/dist/index.html")

@app.get("/")
def root():
    return {"message": "Welcome to the Stocks Social Media"}
# entry point
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))  # cloud run requires PORT env var
    uvicorn.run(app, host="0.0.0.0", port=port)
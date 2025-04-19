from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
import os
import sys

# Add current directory to sys path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# Local imports
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

app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

# Run Reddit connection test
sc.test_reddit_connection()

# Seed stock data
seed_stocks(db=SessionLocal())

# CORS config
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://*.run.app",  # Cloud Run wildcard
    # Add any other deployed frontend origins here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
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

# Health check
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

from fastapi.responses import FileResponse
from fastapi.requests import Request

import os
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

# Other imports and setup remain the same...

# Set up API routes first (before any catch-all routes)
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

# Health check endpoint
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Mount static assets directory explicitly
if os.path.exists("/app/HypeTrade307/dist/assets"):
    app.mount("/assets", StaticFiles(directory="/app/HypeTrade307/dist/assets"), name="static")

# Handle specific files at root level (like favicon.ico, robots.txt, etc.)
@app.get("/favicon.ico")
async def favicon():
    return FileResponse("/app/HypeTrade307/dist/favicon.ico") if os.path.exists("/app/HypeTrade307/dist/favicon.ico") else Response(status_code=404)

# Any other specific static files should be added here...

# Catch-all route handler must be at the end
@app.get("/{path:path}")
async def serve_spa(path: str, request: Request):
    # Don't interfere with API routes
    if path.startswith("api/"):
        # This request will be handled by the API routers
        return Response(status_code=404)

    # Try to serve static file directly if it exists
    file_path = f"/app/HypeTrade307/dist/{path}"
    if os.path.exists(file_path) and not os.path.isdir(file_path):
        return FileResponse(file_path)

    # Fall back to index.html for all other routes (to be handled by React Router)
    return FileResponse("/app/HypeTrade307/dist/index.html")
# Entry point
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))  # Cloud Run requires PORT env var
    uvicorn.run(app, host="0.0.0.0", port=port)
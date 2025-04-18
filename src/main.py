from fastapi import FastAPI
import uvicorn
from fastapi.openapi.models import Response

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

# Serve the frontend static files in production
# app.mount("/", StaticFiles(directory="/app/HypeTrade307/dist", html=True), name="frontend")

# from fastapi import Request
#
# @app.get("/{full_path:path}")
# def serve_frontend(full_path: str, request: Request):
#     # don't serve index.html for API calls
#     if request.url.path.startswith("/api"):
#         return FileResponse("/app/HypeTrade307/dist/Page_Not_Found.tsx")
#
#     file_path = f"/app/HypeTrade307/dist/{full_path}"
#     if os.path.exists(file_path):
#         return FileResponse(file_path)
#     return FileResponse("/app/HypeTrade307/dist/index.html")

from fastapi import Request, Response

# Remove the earlier StaticFiles mount since we're handling all routes manually
# app.mount("/", StaticFiles(directory="/app/HypeTrade307/dist", html=True), name="frontend")

# Serve static assets (JS, CSS, images)
app.mount("/assets", StaticFiles(directory="/app/HypeTrade307/dist/assets"), name="static")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str, request: Request):
    # Handle API routes - let them go to the API handlers
    if request.url.path.startswith("/api/"):
        # This will just continue to the next route handler
        return Response(status_code=404)

    # Look for specific files (like favicon, manifest, etc.)
    file_path = f"/app/HypeTrade307/dist/{full_path}"
    if os.path.exists(file_path) and not os.path.isdir(file_path):
        return FileResponse(file_path)

    # For all other routes, serve the index.html for client-side routing
    return FileResponse("/app/HypeTrade307/dist/index.html")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# entry point
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))  # cloud run requires PORT env var
    uvicorn.run(app, host="0.0.0.0", port=port)
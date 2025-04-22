from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
import os
import sys
print("frontend folder contents:", os.listdir("/app/frontend"))
# Add current directory to sys path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import uvicorn
from fastapi import HTTPException
import json

# Local imports
# import backend functions
from src import check_if_friends as cf, search_users as su

# import database setup
from src.db import crud
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
from src.api.routes.friends import router as friends_router
from src.processing.stock_processing import seed_stocks
from src.processing import scraping as sc
from src.api.routes.flagging import router as flagging_router
from src.api.routes.tasks import router as tasks_router


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
    "https://hypet-145797464141.us-central1.run.app/",  # Cloud Run wildcard
    "https://hypet-145797464141.us-central1.run.app",  # Cloud Run wildcard
    "https://hypetrade-145797464141.us-central1.run.app/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
app.include_router(tasks_router, prefix="/api")
app.include_router(flagging_router, prefix="/api")

# Health check
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Mount static assets directory explicitly
# IMPORTANT: Update the path to where your frontend files are actually located
frontend_path = "/app/frontend"
if os.path.exists(f"{frontend_path}/assets"):
    app.mount("/assets", StaticFiles(directory=f"{frontend_path}/assets"), name="static")

# Handle specific files at root level
@app.get("/favicon.ico")
async def favicon():
    favicon_path = f"{frontend_path}/favicon.ico"
    return FileResponse(favicon_path) if os.path.exists(favicon_path) else Response(status_code=404)

# Catch-all route for SPA - MUST be last
@app.get("/{full_path:path}")
async def serve_spa(full_path: str, request: Request):
    print(f"Handling request for: {full_path}")

    # Don't handle API routes here
    if full_path.startswith("api/"):
        print("API route, not handling in SPA catch-all")
        return Response(status_code=404)

    # Try to serve the requested path directly if it exists
    file_path = f"{frontend_path}/{full_path}"
    print(f"Checking if file exists at: {file_path}")
    if os.path.exists(file_path) and not os.path.isdir(file_path):
        print(f"File exists, serving directly: {file_path}")
        return FileResponse(file_path)

    # List what files are actually in the frontend directory
    print(f"Contents of {frontend_path}:")
    if os.path.exists(frontend_path):
        print(os.listdir(frontend_path))
    else:
        print(f"Directory {frontend_path} does not exist!")

    # Fall back to index.html for client-side routing
    index_path = f"{frontend_path}/index.html"
    print(f"Checking for index at: {index_path}")
    if os.path.exists(index_path):
        print(f"Serving index.html for route: {full_path}")
        return FileResponse(index_path)
    else:
        print(f"Index file not found at {index_path}")

    print(f"404 - Could not serve: {full_path}")
    return Response(status_code=404)

# Entry point
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
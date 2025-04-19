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
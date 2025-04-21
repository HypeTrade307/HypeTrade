from fastapi import APIRouter
from src.services.digest import run_daily_digest

router = APIRouter()

@router.post("/tasks/daily-digest", tags=["tasks"])
async def trigger_daily_digest():
    await run_daily_digest()
    return {"status": "Daily digest triggered"}
from fastapi import APIRouter, Depends
from src.db.database import get_db
from src.services.digest import run_daily_digest

router = APIRouter()

@router.post("/tasks/daily-digest", tags=["tasks"])
async def trigger_daily_digest():
    print("trigger daily digest")
    # await run_daily_digest(Depends(get_db))
    return {"status": "Daily digest triggered"}
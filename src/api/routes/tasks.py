from fastapi import APIRouter, Depends

from services.email_send import send_simple_message
from src.db.database import get_db
from src.services.digest import run_daily_digest

router = APIRouter()

@router.post("/tasks/daily-digest", tags=["tasks"])
async def trigger_daily_digest():
    send_simple_message("adityagandhi98101@gmail.com", "running the thing")
    print("trigger daily digest")
    await run_daily_digest(Depends(get_db))
    return {"status": "Daily digest triggered"}
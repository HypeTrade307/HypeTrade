from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from . import models, schemas, database
import datetime
from typing import List

router = APIRouter()

# Dependency to get the database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/threads/", response_model=schemas.Thread)
def create_thread(thread: schemas.ThreadCreate, db: Session = Depends(get_db)):
    """
    Create a new thread associated with a forum and a stock.
    """
    forum = db.query(models.Forum).filter(models.Forum.forum_id == thread.forum_id).first()
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")

    stock = db.query(models.Stock).filter(models.Stock.stock_id == thread.stock_id).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    db_thread = models.Thread(
        thread_title=thread.thread_title,
        forum_id=thread.forum_id,
        stock_id=thread.stock_id,
        created_at=datetime.utcnow(),
    )
    db.add(db_thread)
    db.commit()
    db.refresh(db_thread)
    return db_thread

@router.get("/forums/{forum_id}/threads/", response_model=List[schemas.Thread])
def get_threads(forum_id: int, db: Session = Depends(get_db)):
    """
    Get all threads associated with a specific forum.
    """
    threads = db.query(models.Thread).filter(models.Thread.forum_id == forum_id).all()
    if not threads:
        raise HTTPException(status_code=404, detail="No threads found in this forum")
    return threads
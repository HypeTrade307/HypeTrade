from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from src.db import models
from src.security import get_current_user  # This dependency decodes the JWT and returns the current user.
from src.db.database import get_db
from src.db import schemas


# router = APIRouter(prefix="/forum", tags=["Forum"])
router = APIRouter(tags=["Forum"])

@router.post("/api/threads/", response_model=schemas.ThreadResponse)
def create_thread(
        thread_data: schemas.ThreadCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    new_thread = models.Thread(
        title=thread_data.title,
        creator_id=current_user.user_id,
        stock_id=thread_data.stock_id
    )
    db.add(new_thread)
    db.commit()
    db.refresh(new_thread)
    return new_thread

@router.get("/threads/{stock_id}", response_model=List[schemas.ThreadResponse])
def get_threads(stock_id: int, db: Session = Depends(get_db)):
    return db.query(models.Thread).filter(models.Thread.stock_id == stock_id).all()

@router.get("/posts/{thread_id}", response_model=List[schemas.PostResponse])
def get_posts(thread_id: int, db: Session = Depends(get_db)):
    return db.query(models.Post).filter(models.Post.thread_id == thread_id).all()
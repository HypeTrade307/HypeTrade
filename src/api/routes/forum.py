from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.db import models
from src.security import get_current_user
from src.db.database import get_db
from src.db import schemas
from src.db import crud

router = APIRouter(prefix="/threads", tags=["Threads"])

# Assumption 1: You have equivalent schemas for Thread operations
# Assumption 2: Your CRUD functions have thread equivalents (create_thread, get_thread, etc.)

@router.post("/", response_model=schemas.ThreadResponse)
def create_new_thread(
    thread_data: schemas.ThreadCreate,  # Should include title, stock_id, and optional forum_id
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Clarification: Threads require a stock reference based on your model
    if not crud.get_stock(db, thread_data.stock_id):
        raise HTTPException(status_code=400, detail="Invalid stock reference")
    
    new_thread = crud.create_thread(
        db,
        creator_id=current_user.user_id,
        title=thread_data.title,
        stock_id=thread_data.stock_id,
        forum_id=thread_data.forum_id 
    )
    return new_thread

@router.get("/{thread_id}", response_model=schemas.ThreadResponse)
def get_thread(thread_id: int, db: Session = Depends(get_db)):
    thread = crud.get_thread(db, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread

@router.get("/", response_model=List[schemas.ThreadResponse])
def get_user_threads(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_threads_by_user(db, current_user.user_id)

@router.put("/{thread_id}", response_model=schemas.ThreadResponse)
def update_thread(
    thread_id: int,
    thread_update: schemas.ThreadUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    thread = crud.get_thread(db, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    if thread.creator_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this thread")
    
    # Clarification: Should stock_id be updatable? Depends on your business logic
    updated = crud.update_thread(
        db,
        thread_id=thread_id,
        title=thread_update.title,
        stock_id=thread_update.stock_id,
        forum_id=thread_update.forum_id
    )
    return updated

@router.delete("/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_thread(
    thread_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    thread = crud.get_thread(db, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    if thread.creator_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this thread")
    crud.delete_thread(db, thread_id)
    return

# POSTS ENDPOINTS WOULD BE IN A SEPARATE ROUTER (posts.py)
# Similar to portfolio_stocks relationship but with different structure
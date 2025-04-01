from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from src.db import models
from src.security import get_current_user  # This dependency decodes the JWT and returns the current user.
from src.db.database import get_db
from src.db import schemas
from src.db import crud

from fastapi.logger import logger

router = APIRouter(prefix="/threads", tags=["Forum"])

@router.post("/", response_model=schemas.ThreadResponse)
def create_thread(
        thread_data: schemas.ThreadCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    logger.info(f"Received data: {thread_data.model_dump()}")  # Debugging line
    """Create a new thread with the current user as creator"""
    try:
        # Verify the thread exists
        # thread = db.query(models.Stock).filter(models.Stock.stock_id == thread_data.stock_id).first()
        thread = crud.get_thread_by_title_stock(db, thread_data.title, thread_data.stock_id)
        if thread:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"thread with name {thread_data.title} for this stock already exists"
            )

        return crud.create_thread(db, user_id=current_user.user_id, thread_name=thread_data.title, stock_id=thread_data.stock_id)

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@router.get("/", response_model=List[schemas.ThreadResponse])
def get_threads(
        skip: int = 0,
        limit: int = 20,
        db: Session = Depends(get_db),
):
    # """Get all threads with pagination"""
    # threads = db.query(models.Thread).order_by(models.Thread.created_at.desc()).offset(skip).limit(limit).all()
    return crud.get_threads(db)

@router.get("/{thread_id}", response_model=schemas.ThreadResponse)
def get_thread(
        thread_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Get a specific thread by ID"""
    # thread = db.query(models.Thread).filter(models.Thread.thread_id == thread_id).first()
    thread = crud.get_thread_by_id(db, thread_id)
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread with ID {thread_id} not found"
        )
    return thread

@router.delete("/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_thread(
        thread_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Delete a thread (only by the creator or an admin)"""
    thread = db.query(models.Thread).filter(models.Thread.thread_id == thread_id).first()

    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread with ID {thread_id} not found"
        )

    # Check if the current user is the creator of the thread
    if thread.creator_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this thread"
        )

    db.delete(thread)
    db.commit()
    return None
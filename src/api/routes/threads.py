from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.db import models
from src.security import get_current_user  # This dependency decodes the JWT and returns the current user.
from src.db.database import get_db
from src.db import schemas
from src.db import crud
from fastapi.logger import logger


router = APIRouter(
    prefix="/threads",
    tags=["Threads"]
)

# Get all threads
@router.get("/", response_model=List[schemas.ThreadResponse])
def get_threads(
        skip: int = 0,
        limit: int = 20,
        db: Session = Depends(get_db),
):
    return crud.get_threads(db)

# Get thread metadata by ID
@router.get("/{thread_id}/metadata", response_model=schemas.ThreadResponse)
def get_thread(thread_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    thread = crud.get_thread_by_id(db, thread_id)
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread with ID {thread_id} not found"
        )
    return thread

# Get all posts for a thread
@router.get("/{thread_id}/posts", response_model=List[schemas.PostResponse])
def get_thread_posts(thread_id: int, db: Session = Depends(get_db)):
    posts = crud.get_posts_by_thread_id(db, thread_id)
    return posts

# Create a new thread
@router.post("/", response_model=schemas.ThreadResponse)
def create_thread(
        thread_data: schemas.ThreadCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    logger.info(f"Received data: {thread_data.model_dump()}")
    try:
        thread = crud.get_thread_by_title_stock(db, thread_data.title, thread_data.stock_id)
        if thread:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Thread with name {thread_data.title} for this stock already exists"
            )
        return crud.create_thread(db, user_id=current_user.user_id, thread_name=thread_data.title, stock_id=thread_data.stock_id)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

# Create a new post in a thread
@router.post("/{thread_id}/posts", response_model=schemas.PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
        thread_id: int,
        post: schemas.PostCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    thread = crud.get_thread_by_id(db, thread_id)
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Thread with id {thread_id} not found")
    new_post = crud.create_post(db, title=post.title,
                                content=post.content,
                                created_by=current_user.user_id,
                                thread_id=thread_id)
    return new_post

# Delete a thread
@router.delete("/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_thread(
        thread_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    thread = db.query(models.Thread).filter(models.Thread.thread_id == thread_id).first()
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread with ID {thread_id} not found"
        )
    if thread.creator_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this thread"
        )
    db.delete(thread)
    db.commit()
    return None

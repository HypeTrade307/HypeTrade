from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.db import models
from src.security import get_current_user  # This dependency decodes the JWT and returns the current user.
from src.db.database import get_db
from src.db import schemas
from src.db import crud

router = APIRouter(
    prefix="/thread",
    tags=["Threads"]
)

# Get all posts for a thread
@router.get("/{thread_id}", response_model=List[schemas.PostResponse])
def get_thread_posts(thread_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify thread exists
    thread = db.query(models.Thread).filter(models.Thread.thread_id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Thread with id {thread_id} not found")

    # Get all posts for the thread
    posts = db.query(models.Post).filter(models.Post.thread_id == thread_id).all()
    posts = crud.get_posts_by_thread_id(db, thread_id)

    # # Eager load author information for each post
    # for post in posts:
    #     post.author = db.query(models.User).filter(models.User.user_id == post.author_id).first()

    return posts

# Create a new post in a thread
@router.post("/{thread_id}/posts", response_model=schemas.PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
        thread_id: int,
        post: schemas.PostCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    # Verify thread exists
    thread = crud.get_thread_by_id(db, thread_id)
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Thread with id {thread_id} not found")

    # Create the new post

    new_post = crud.create_post(db, title=post.title,
                                content=post.content,
                                created_by=current_user.user_id)
    return new_post
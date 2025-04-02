from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from src.db import models
from src.security import get_current_user
from src.db.database import get_db
from src.db import schemas
from src.db import crud
from fastapi.logger import logger


# Comment schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    comment_id: int
    post_id: int
    author_id: int
    created_at: datetime
    author: Optional[dict] = None
    liked_by: Optional[List[dict]] = None

    class Config:
        from_attributes = True


router = APIRouter(
    prefix="/post",
    tags=["Posts"]
)

# Get a specific post by ID
@router.get("/{post_id}", response_model=schemas.PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = crud.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {post_id} not found")
    return post

# Update a post
@router.put("/{post_id}", response_model=schemas.PostResponse)
def update_post(
        post_id: int,
        post_update: schemas.PostUpdate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    # Get the existing post
    existing_post = crud.get_post_by_id(db, post_id)
    if not existing_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {post_id} not found")

    # Check if the current user is the author
    if existing_post.author_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have permission to update this post")

    # Update the post
    updated_post = crud.update_post(db, post_id, post_update.dict(exclude_unset=True))
    return updated_post

# Delete a post
@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
        post_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    # Get the existing post
    existing_post = crud.get_post_by_id(db, post_id)
    if not existing_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {post_id} not found")

    # Check if the current user is the author
    if existing_post.author_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have permission to delete this post")

    # Delete the post
    crud.delete_post(db, post_id)
    return None

# Like a post
@router.post("/{post_id}/like", status_code=status.HTTP_200_OK)
def like_post(
        post_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    # Get the existing post
    post = crud.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {post_id} not found")

    # Add like
    result = crud.add_post_like(db, post_id, current_user.user_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already liked this post")

    return {"message": "Post liked successfully"}

# Unlike a post
@router.post("/{post_id}/unlike", status_code=status.HTTP_200_OK)
def unlike_post(
        post_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    # Get the existing post
    post = crud.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {post_id} not found")

    # Remove like
    result = crud.remove_post_like(db, post_id, current_user.user_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You haven't liked this post")

    return {"message": "Post unliked successfully"}

# Get all comments for a post
@router.get("/{post_id}/comments", response_model=List[CommentResponse])
def get_post_comments(post_id: int, db: Session = Depends(get_db)):
    # Get all comments for the post
    print(4)
    comments = crud.get_comments_by_post_id(db, post_id)
    print(5)
    return comments

# Create a new comment on a post
@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
        post_id: int,
        comment: CommentCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    # Verify post exists
    post = crud.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {post_id} not found")

    # Create the new comment
    new_comment = crud.create_comment(
        db,
        content=comment.content,
        author_id=current_user.user_id,
        post_id=post_id
    )
    return new_comment


# Comment routes
comment_router = APIRouter(
    prefix="/comment",
    tags=["Comments"]
)

# Update a comment
@comment_router.put("/{comment_id}", response_model=CommentResponse)
def update_comment(
        comment_id: int,
        comment_update: CommentBase,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    # Get the existing comment
    existing_comment = crud.get_comment_by_id(db, comment_id)
    if not existing_comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Comment with id {comment_id} not found")

    # Check if the current user is the author
    if existing_comment.author_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have permission to update this comment")

    # Update the comment
    updated_comment = crud.update_comment(db, comment_id, comment_update.dict())
    return updated_comment

# Delete a comment
@comment_router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
        comment_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    # Get the existing comment
    existing_comment = crud.get_comment_by_id(db, comment_id)
    if not existing_comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Comment with id {comment_id} not found")

    # Check if the current user is the author
    if existing_comment.author_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have permission to delete this comment")

    # Delete the comment
    crud.delete_comment(db, comment_id)
    return None

# Like a comment
@comment_router.post("/{comment_id}/like", status_code=status.HTTP_200_OK)
def like_comment(
        comment_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    # Get the existing comment
    comment = crud.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Comment with id {comment_id} not found")

    # Add like
    result = crud.add_comment_like(db, comment_id, current_user.user_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already liked this comment")

    return {"message": "Comment liked successfully"}

# Unlike a comment
@comment_router.post("/{comment_id}/unlike", status_code=status.HTTP_200_OK)
def unlike_comment(
        comment_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    # Get the existing comment
    comment = crud.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Comment with id {comment_id} not found")

    # Remove like
    result = crud.remove_comment_like(db, comment_id, current_user.user_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You haven't liked this comment")

    return {"message": "Comment unliked successfully"}
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.db import crud, models, schemas
from src.db.database import get_db
from src.security import get_current_user 

router = APIRouter()

@router.post("/send_friend_request/{receiver_id}", response_model=schemas.FriendRequestResponse)
def send_friend_request(
    receiver_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a friend request to another user.
    """
    try:
        success = crud.send_friend_request(db, current_user.user_id, receiver_id)
        if success:
            return {
                "request_id": current_user.user_id,
                "sender_id": current_user.user_id,
                "receiver_id": receiver_id,
                "status": "pending",
                "created_at": datetime.datetime.now(),
                "sender_username": current_user.username
            }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/friend_requests", response_model=List[schemas.FriendRequestResponse])
def get_friend_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all pending friend requests for the current user.
    """
    try:
        return crud.get_friend_requests(db, current_user.user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/accept_friend_request/{sender_id}", response_model=schemas.FriendResponse)
def accept_friend_request(
    sender_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accept a friend request from another user.
    """
    try:
        success = crud.accept_friend_request(db, current_user.user_id, sender_id)
        if success:
            sender = db.query(models.User).filter(models.User.user_id == sender_id).first()
            if sender:
                return {
                    "user_id": sender.user_id,
                    "username": sender.username,
                    "email": sender.email,
                    "created_at": sender.created_at,
                    "updated_at": sender.updated_at
                }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/decline_friend_request/{sender_id}")
def decline_friend_request(
    sender_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Decline a friend request from another user.
    """
    try:
        success = crud.decline_friend_request(db, current_user.user_id, sender_id)
        if success:
            return {"message": "Friend request declined successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/friends", response_model=List[schemas.FriendResponse])
def get_friends(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all friends of the current user.
    """
    try:
        return crud.get_friends(db, current_user.user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/remove_friend/{friend_id}")
def remove_friend(
    friend_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a friend from the current user's friend list.
    """
    try:
        success = crud.remove_friend(db, current_user.user_id, friend_id)
        if success:
            return {"message": "Friend removed successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/friendship_status/{other_user_id}")
def check_friendship_status(
    other_user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check the friendship status between the current user and another user.
    """
    try:
        status = crud.check_friendship_status(db, current_user.user_id, other_user_id)
        return {"status": status}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 
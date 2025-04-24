from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from src.security import get_current_user
from src.db import crud, models, schemas
from src.db.database import get_db

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("/", response_model=schemas.MessageResponse)
def send_message(
    message_data: schemas.MessageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message to another user.
    """
    # Check if users are friends
    friendship_status = crud.check_friendship_status(db, current_user.user_id, message_data.receiver_id)
    if friendship_status != "friends":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only message your friends"
        )
    
    # Get receiver user
    receiver = crud.get_user_by_id(db, message_data.receiver_id)
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found"
        )
    
    # Create the message
    message = crud.create_message(
        db=db,
        sender_id=current_user.user_id,
        receiver_id=message_data.receiver_id,
        content=message_data.content
    )
    
    # Create a notification for the receiver
    crud.create_notification(
        db=db,
        sender_id=current_user.user_id,
        receiver_id=message_data.receiver_id,
        message=f"New message from {current_user.username}: {message_data.content[:50]}..."
    )
    
    # Add usernames to the message response
    message.sender_username = current_user.username
    message.receiver_username = receiver.username
    
    return message

@router.get("/chat/{friend_id}", response_model=List[schemas.MessageResponse])
def get_chat_messages(
    friend_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messages between the current user and a friend.
    """
    # Check if users are friends
    friendship_status = crud.check_friendship_status(db, current_user.user_id, friend_id)
    if friendship_status != "friends":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view messages with your friends"
        )
    
    # Get friend's user info
    friend = crud.get_user_by_id(db, friend_id)
    if not friend:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend not found"
        )
    
    messages = crud.get_messages_between_users(
        db=db,
        user1_id=current_user.user_id,
        user2_id=friend_id,
        skip=skip,
        limit=limit
    )
    
    # Add usernames to each message
    for message in messages:
        message.sender_username = current_user.username if message.sender_id == current_user.user_id else friend.username
        message.receiver_username = friend.username if message.sender_id == current_user.user_id else current_user.username
    
    return messages

@router.post("/{message_id}/flag", response_model=schemas.MessageResponse)
def flag_message(
    message_id: int,
    flag_data: schemas.MessageFlag,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Flag a message for review.
    """
    message = crud.get_message_by_id(db, message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Check if the current user is either the sender or receiver
    if current_user.user_id not in [message.sender_id, message.receiver_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only flag messages in your conversations"
        )
    
    # Create a flag record for the message
    flag = crud.create_flag(
        db=db,
        user_id=current_user.user_id,
        flag_type="message",
        target_id=message_id,
        reason=flag_data.reason
    )
    
    # Create a notification for admins
    admin_users = db.query(models.User).filter(models.User.is_admin == True).all()
    for admin in admin_users:
        crud.create_notification(
            db=db,
            sender_id=current_user.user_id,
            receiver_id=admin.user_id,
            message=f"Message flagged by {current_user.username}: {flag_data.reason}"
        )
    
    # Get sender and receiver usernames
    sender = crud.get_user_by_id(db, message.sender_id)
    receiver = crud.get_user_by_id(db, message.receiver_id)
    
    # Add usernames to the message response
    message.sender_username = sender.username
    message.receiver_username = receiver.username
    
    return message 
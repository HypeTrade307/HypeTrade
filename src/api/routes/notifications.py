from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import random

from src.db.database import get_db
from src.db import crud, models, schemas

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)

# Get all notifications for a user
@router.get("/user/{user_id}", response_model=List[schemas.Notification])
def read_user_notifications(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    notifications = crud.get_user_notifications(db, user_id=user_id, skip=skip, limit=limit)
    return notifications

# Mark a notification as read
@router.put("/mark-read/{notification_id}", response_model=schemas.Notification)
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notification = crud.mark_notification_as_read(db, notification_id=notification_id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

# Mark all notifications as read for a user
@router.put("/mark-all-read/{user_id}")
def mark_all_notifications_read(user_id: int, db: Session = Depends(get_db)):
    success = crud.mark_all_notifications_as_read(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to mark notifications as read")
    return {"status": "success"}

# Create a new notification (for testing purposes)
@router.post("/", response_model=schemas.Notification)
def create_notification(notification: schemas.NotificationCreate, db: Session = Depends(get_db)):
    return crud.create_notification(db=db, notification=notification)
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from src.security import get_current_user

import random

from src.db.database import get_db
from src.db import crud, models, schemas

router = APIRouter()

# Top stocks endpoint
@router.get("/stocks/top/", response_model=List[schemas.StockBase])
def read_top_stocks(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieve top stocks with auto analysis mode.
    """
    stocks = crud.get_top_stocks(db, limit)
    return stocks

# Stock sentiment endpoint
@router.get("/stocks/sentiment/{stock_id}", response_model=List[schemas.StockBase])
def read_stock_sentiment(
    stock_id: int,
    interval: int = Query(1, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Retrieve sentiment data for a specific stock over a time interval.
    """
    timeframe = f"{interval}d"  # Format for the CRUD function
    sentiment_data = crud.get_sentiment_summary_for_stock_in_range(db, stock_id, timeframe)
    return sentiment_data

# User notifications endpoint
@router.get("/notifications/user/", response_model=List[schemas.Notification])
def read_user_notifications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve notifications for a specific user.
    """ 
    notifications = crud.get_user_notifications(db, current_user.user_id)
    return notifications

# Mark notification as read endpoint
@router.put("/notifications/mark-read/{notification_id}", response_model=schemas.Notification)
def mark_notification_read(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a specific notification as read.
    """
    # Get the notification first
    notification = db.query(models.Notification).filter(
        models.Notification.notification_id == notification_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    # Security check - users can only mark their own notifications
    if notification.receiver_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this notification")
    
    updated_notification = crud.mark_notification_as_read(db, notification_id)
    return updated_notification

@router.put("/notifications/mark-all-read/")
def mark_all_notifications_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
         
    crud.mark_all_notifications_as_read(db, current_user.user_id)
    return {"success": True, "message": "All notifications marked as read"}

@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a notification by its ID.
    """
    # Get the notification first
    notification = db.query(models.Notification).filter(
        models.Notification.notification_id == notification_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    # Security check - users can only delete their own notifications
    if notification.receiver_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this notification")
    
    success = crud.delete_notification(db, notification_id)
    if success:
        return {"success": True, "message": "Notification deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete notification")

@router.post("/notifications/create", response_model=schemas.Notification)
def create_notification(
    notification_data: schemas.NotificationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a notification.
    """
    # System user ID for system-generated notifications
    system_user_id = 1  # ID = 1 represents the system
    
    # Create the notification
    new_notification = crud.create_notification(
        db=db,
        sender_id=system_user_id,  # From system
        receiver_id= current_user.user_id,
        message=notification_data.message,
        stock_id=notification_data.stock_id if hasattr(notification_data, 'stock_id') else None
    )
    
    return new_notification
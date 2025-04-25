from typing import List
from sqlalchemy.orm import Session
from src.db import crud, models, schemas
from src.db.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from src.security import get_current_user

router = APIRouter(prefix="/flag", tags=["Flags"])

@router.post("/", response_model=schemas.FlagBase, status_code=status.HTTP_201_CREATED)
def flag(flag_data: schemas.FlagCreate, 
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)):
    """
    Flag a content with a reason.
    """
    #----------
    #THIS DOESNT CHECK FOR DUPLICATE FLAGS, IT ALLOWS MULTIPLE FLAGS FROM THE SAME USER ON THE SAME CONTENT
    #----------

    # Create the flag
    flag = crud.create_flag(db, user_id = current_user.user_id, flag_type = flag_data.flag_type, target_id = flag_data.target_id, reason = flag_data.reason)
    if not flag:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Flag creation failed.")
    return flag

@router.get("/all", response_model=List[schemas.FlagResponse])
def get_all_flags(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    flags = db.query(models.Flag).all()
    # Enrich flag data with thread_id and post_id
    for flag in flags:
        if flag.flag_type == "post":
            post = db.query(models.Post).filter(models.Post.post_id == flag.target_id).first()
            if post:
                flag.thread_id = post.thread_id
        elif flag.flag_type == "comment":
            comment = db.query(models.Comment).filter(models.Comment.comment_id == flag.target_id).first()
            if comment:
                flag.thread_id = comment.post.thread_id
                flag.post_id = comment.post_id
        elif flag.flag_type == "message":
            message = db.query(models.Message).filter(models.Message.message_id == flag.target_id).first()
            if message:
                sender = db.query(models.User).filter(models.User.user_id == message.sender_id).first()
                if sender:
                    flag.sender_username = sender.username
                    flag.content = message.content
                    flag.created_at = message.created_at
    return flags

@router.delete("/{flag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_flag(flag_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Remove a flag from the content.
    """
    #check if user is authorized
    admin = crud.get_user_by_id(db, user_id = current_user.user_id)
    if not admin.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to remove flags.")
    
    # Remove the flag
    crud.remove_flag(db, flag_id = flag_id)
    return status.HTTP_200_OK

@router.delete("/{flag_id}/remove_with_content", status_code=status.HTTP_200_OK)
def resolve_and_delete_content(
    flag_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    print("Resolving and deleting content for flag ID:", flag_id)
    flag = db.query(models.Flag).filter(models.Flag.flag_id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")

    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can perform this action")

    # Delete the content
    if flag.flag_type == "post":
        crud.delete_post(db, flag.target_id)
    elif flag.flag_type == "comment":
        crud.delete_comment(db, flag.target_id)
    elif flag.flag_type == "thread":
        crud.delete_thread(db, flag.target_id)
    elif flag.flag_type == "user":
        crud.delete_user(db, flag.target_id)
    elif flag.flag_type == "message":
        message = crud.get_message_by_id(db, flag.target_id)
        if message:
            db.delete(message)
            db.commit()
    else:
        raise HTTPException(status_code=400, detail="Invalid flag type")
    # Delete the flag
    crud.remove_flag(db, flag.flag_id)

    return {"message": f"{flag.flag_type.capitalize()} and flag removed successfully"}




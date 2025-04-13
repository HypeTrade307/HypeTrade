
from typing import List
from sqlalchemy.orm import Session
from src.db import crud, models, schemas
from src.db.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from src.security import get_current_user

router = APIRouter(prefix="/flag", tags=["Flags"])

@router.post("/", response_model=schemas.FlagResponse, status_code=status.HTTP_201_CREATED)
def flag(db: Session, flag_data: schemas.FlagCreate, current_user: models.User = Depends(get_current_user)):
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

@router.delete("/{flag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_flag(db: Session, flag_data: schemas.FlagBase, current_user: models.User = Depends(get_current_user)):
    """
    Remove a flag from the content.
    """
    #check if user is authorized
    admin = crud.get_user_by_id(db, user_id = current_user.user_id)
    if not admin.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to remove flags.")
    
    # Remove the flag
    crud.remove_flag(db, flag_id = flag_data.flag_id)
    return status.HTTP_200_OK

@router.get("/", response_model=List[schemas.FlagResponse])
def get_flags(db: Session, current_user: models.User = Depends(get_current_user)):
    """
    Get all flags
    """
    #check if user is authorized
    admin = crud.get_user_by_id(db, user_id = current_user.user_id)
    if not admin.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view flags.")
    
    # Get all flags
    flags = crud.get_all_flags(db)
    return flags

    
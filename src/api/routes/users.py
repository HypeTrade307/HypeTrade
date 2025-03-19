from enum import Enum
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.db import crud, schemas
from src.db.database import get_db
from src.services.validation import Errors, validate_update, validate_create

router = APIRouter(prefix="/users", tags=["Users"])

ERROR_MESSAGES = {
    Errors.PASSWORD: "Password length should be greater than 10, contain uppercase, lowercase, and a number.",
    Errors.EMAIL: "Email should be a gmail.",
    Errors.EMAIL_TAKEN: "Email is already registered.",
    Errors.USERNAME: "Username is taken."
}


# @router.post("/", response_model=schemas.UserResponse)
# def create_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
#     error = validate_create(db = db, user_data=user_data)
#     if error != Errors.OK:
#         raise HTTPException(status_code=400, detail=ERROR_MESSAGES[error])
    
#     new_user = crud.create_user(db, user_data)
#     return new_user


@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=list[schemas.UserResponse])
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_users(db, skip, limit)

@router.get("/search/{name}", response_model=list[schemas.UserResponse])
def search_user(name: str, db: Session = Depends(get_db)):
    return crud.get_user_by_name(db, name=name)
    
@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    updated_user = crud.update_user(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    error = validate_update(user_data=user_update)
    if error != Errors.OK:
        raise HTTPException(status_code=400, detail=ERROR_MESSAGES[error])
    return updated_user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    deleted_user = crud.delete_user(db, user_id)
    if not deleted_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user_id} deleted successfully"}

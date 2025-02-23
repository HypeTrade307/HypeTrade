from enum import Enum
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.db import crud, schemas
from src.services.validation import validate_update, validate_create

router = APIRouter(prefix="/users", tags=["Users"])

class ErrorCodes(Enum):
    1 = "Password length should be greater than 10, contain at least 1 uppercase and lower case and a number."
    2 = "Email is already registered"
    3 = "Username is taken"


@router.post("/", response_model=schemas.UserResponse)
def create_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # db_user = crud.get_user_by_email(db, user_data.email)  # or get by email
    # if db_user:
    #     raise HTTPException(status_code=400, detail="Email is already registered.")
    
    # db_user = crud.get_user_by_name(db, user_data.name)

    # if db_user: # If we had a function get_user_by_email
    #     raise HTTPException(status_code=400, detail="Username is taken.")

    # password = user_data.password

    # if len(password) < 10:
    #     raise HTTPException(status_code=400, detail="Password length should be greater than 10.")
    # if not re.search(r"[A-Z]", password):
    #     raise HTTPException(status_code=400, detail="Password should contain at least 1 uppercase letter.")
    # if not re.search(r"[a-z]", password):
    #     raise HTTPException(status_code=400, detail="Password should contain at least 1 lowercase letter.")
    # if not re.search(r"[0-9]", password):
    #     raise HTTPException(status_code=400, detail="Password should contain at least 1 number.")

    error = ErrorCodes(validate_create(db = db, user_data=user_data))
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    new_user = crud.create_user(db, user_data)
    return new_user


@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=list[schemas.UserResponse])
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_users(db, skip, limit)


@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    updated_user = crud.update_user(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    error = ErrorCodes(validate_update(user_data=user_update))
    if error:
        raise HTTPException(status_code=400, detail=error)
    return updated_user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    deleted_user = crud.delete_user(db, user_id)
    if not deleted_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user_id} deleted successfully"}

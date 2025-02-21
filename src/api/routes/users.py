
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.db import schemas, models, crud
from src.db.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.create_user(db, user)
    return db_user

@router.get("/", response_model=list[schemas.UserResponse])
def get_users(db: Session = Depends(get_db), skip: int = 0, limit: int = 10):
    return crud.get_users(db, skip, limit)

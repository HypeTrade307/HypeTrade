# routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.services.validation import Errors, validate_create
from src.db.database import get_db
from src.db import schemas
from src.db.crud import get_user_by_email, create_user  # adapt to your code
from src.security import verify_password, hash_password, create_access_token
from src.db.models import User

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user. 
    Example schema for UserCreate might have email, password, name, etc.
    """
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    validation=validate_create(db=db, user_data=user_data)
    msg = "User created successfully"
    if validation != Errors.OK:
        msg = "Validation error"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid sign-up data"
        )
    hashed_pw = hash_password(user_data.password)
    user_data.password = hashed_pw
    new_user = create_user(db, user_data)
    return {"msg": msg, "user_id": new_user.user_id}

@router.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Verify user credentials. If valid, return a JWT token.
    Example: 
      request body: { "email": "user@example.com", "password": "somepw" }
      response: { "access_token": "xxxxxx", "token_type": "bearer" }
    """
    user = get_user_by_email(db, login_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    if not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(data={"sub": str(user.user_id)})
    return {"access_token": access_token, "token_type": "bearer"}

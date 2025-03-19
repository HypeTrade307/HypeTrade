# routes/auth.py
import random

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.services.email_send import send_simple_message
from src.services.validation import Errors, validate_create
from src.db.database import get_db
from src.db import schemas
from src.db.crud import get_user_by_email, create_user  # adapt to your code
from src.security import verify_password, hash_password, create_access_token
from src.db.models import User
from pydantic import BaseModel


router = APIRouter(prefix="/auth", tags=["Auth"])

confirmation_codes = {}
class EmailSchema(BaseModel):
    email: str
@router.post("/send_confirmation_code")
def send_confirmation_code(payload: EmailSchema):
    """
    Generates and sends a confirmation code for user verification.
    """
    email = payload.email
    print("sending code")
    code = random.randint(100000, 999999)
    confirmation_codes[email] = code
    send_simple_message(email, f"Your confirmation code is: {code}")
    return {"msg": "Code sent", "code": code}

#@router.post("/signup", status_code=201)
@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    if user_data.email not in confirmation_codes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation code not requested"
        )

    if confirmation_codes[user_data.email] != user_data.confirmation_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid confirmation code"
        )

    hashed_pw = hash_password(user_data.password)
    user_data.password = hashed_pw
    new_user = create_user(db, user_data)

    return {"msg": "User created successfully", "user_id": new_user.user_id}


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

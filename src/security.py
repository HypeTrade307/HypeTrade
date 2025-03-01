# security.py
from passlib.hash import bcrypt as hashing
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# Import your own config or define your constants here
SECRET_KEY = "SOME_SUPER_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

from src.db.database import get_db  # adjust import
from src.db.models import User      # your SQLAlchemy user model
from src.db.crud import get_user_by_id  # or however you fetch a user by ID

# passlib context for hashing

# The OAuth2 scheme for extracting the token from the `Authorization: Bearer <token>` header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(password: str) -> str:
    """Hash a plain text password using bcrypt."""
    return hashing.hash(f"{password}")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against the hashed password stored in DB."""
    return hashing.verify(f"{plain_password}", hashed_password)

def create_access_token(data: dict, expires_delta: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    """
    Create a JWT token, embedding `data` (like {"sub": user_id}),
    with an expiration set to `expires_delta` minutes from now.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Decode the JWT token, validate it, and fetch the user from DB.
    If invalid, raise 401. If user not found, raise 401.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no subject",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = get_user_by_id(db, int(user_id))  # user_id is string, convert to int
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user

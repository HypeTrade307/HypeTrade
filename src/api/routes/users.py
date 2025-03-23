from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.security import get_current_user, verify_password
from src.db import crud, models, schemas
from src.db.database import get_db
from src.services.validation import Errors, validate_password, validate_update, validate_create

router = APIRouter(prefix="/users", tags=["Users"])

ERROR_MESSAGES = {
    Errors.PASSWORD: "Password length should be greater than 10, contain uppercase, lowercase, and a number.",
    Errors.EMAIL: "Email should be a gmail.",
    Errors.EMAIL_TAKEN: "Email is already registered.",
    Errors.USERNAME: "Username is taken."
}

####################################
#  Create / Read / Search (public or admin usage)
####################################

# If you want to allow creating new users via POST:
# @router.post("/", response_model=schemas.UserResponse)
# def create_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
#     error = validate_create(db=db, user_data=user_data)
#     if error != Errors.OK:
#         raise HTTPException(status_code=400, detail=ERROR_MESSAGES[error])
#     new_user = crud.create_user(db, user_data)
#     return new_user

@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    """
    Fetch any user's data by ID (for admin usage).
    The 'user_id' path param is used here, unlike the /me route.
    """
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=list[schemas.UserResponse])
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    Fetch a list of all users, possibly for admin usage.
    """
    return crud.get_users(db, skip, limit)

@router.get("/search/{name}", response_model=list[schemas.UserResponse])
def search_user(name: str, db: Session = Depends(get_db)):
    """
    Search users by name (partial match).
    """
    return crud.get_user_by_name(db, name=name)

####################################
#  Current User Endpoints (No user_id path)
####################################

@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns the currently authenticated user's data.
    Useful if the front-end wants to fetch the user’s own profile.
    """
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_user(
    user_update: schemas.UserBase, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Updates the username and email for the current user (from the token).
    Ignores any path param, so the user can't spoof someone else's ID.
    """
    error = validate_update(db, user_update)
    if error != Errors.OK:
        raise HTTPException(status_code=400, detail=ERROR_MESSAGES[error])
    
    updated_user = crud.update_user(db, current_user.user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.put("/me/password", response_model=schemas.UserResponse)
def update_user_password(
    password_update: schemas.UserPasswordUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """
    Updates the current user's password.
    Requires 'old_password' plus 'new_password'.
    """
    error = validate_password(password_update.new_password)
    if error != Errors.OK:
        raise HTTPException(status_code=400, detail=ERROR_MESSAGES[error])
    
    verified_password = verify_password(password_update.old_password, crud.get_password(db, current_user.user_id))
    if not verified_password:
        raise HTTPException(status_code=400, detail="Password incorrect")
    
    return crud.update_password(db, current_user.user_id, password_update.new_password)

@router.delete("/me")
def delete_user(
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Deletes the current user's account.
    """
    deleted_user = crud.delete_user(db, current_user.user_id)
    if not deleted_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {current_user.username} deleted successfully"}


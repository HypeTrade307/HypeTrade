from enum import Enum
import src.db.crud as crud
import src.db.schemas as schemas
from sqlalchemy.orm import Session
import re

class Errors(Enum):
    OK = 0
    PASSWORD = 1
    EMAIL = 2
    EMAIL_TAKEN = 3
    USERNAME = 4

def validate_create(db: Session, user_data : schemas.UserCreate):
    if not (re.search(r'[a-z]', user_data.password) or re.search(r'[A-Z]', user_data.password) or re.search(r'[0-9]', user_data.password)) or len(user_data.password) < 10:
        return Errors.PASSWORD
    if crud.get_user_by_email(db, email=user_data.email):
        return Errors.EMAIL_TAKEN
    if not user_data.email.endswith("@gmail.com"):
            return Errors.EMAIL
    if crud.get_user_by_name(db, name=user_data.username):
        return Errors.USERNAME
    return Errors.OK

def validate_update(db : Session, user_data : schemas.UserUpdate):
    if not re.search(r"[a-zA-Z0-9]", user_data.password):
        return Errors.PASSWORD
    if crud.get_user_by_email(db, email=user_data.email):
        return Errors.EMAIL
    if crud.get_user_by_name(db, name=user_data.name):
        return Errors.USERNAME
    return Errors.OK

def validate_password(password : str):
    if not (re.search(r'[a-z]', password) or re.search(r'[A-Z]', password) or re.search(r'[0-9]', password)) or len(password) < 10:
        return Errors.PASSWORD
    return Errors.OK
from enum import Enum
import src.db.crud as crud
import src.db.schemas as schemas
from sqlalchemy.orm import Session
import re

class Errors(Enum):
    PASSWORD = 1
    EMAIL = 2
    USERNAME = 3

def validate_create(db: Session, user_data : schemas.UserCreate):
    if not re.search(r"[a-zA-Z0-9]", user_data.password):
        return Errors.PASSWORD
    if crud.get_user_by_email(db, email=user_data.email):
        return Errors.EMAIL
    if crud.get_user_by_name(db, name=user_data.name):
        return Errors.USERNAME
    return 0

def validate_update(db : Session, user_data : schemas.UserUpdate):
    if not re.search(r"[a-zA-Z0-9]", user_data.password):
        return Errors.PASSWORD
    if crud.get_user_by_email(db, email=user_data.email):
        return Errors.EMAIL
    if crud.get_user_by_name(db, name=user_data.name):
        return Errors.USERNAME
    return 0
from sqlalchemy.orm import Session
from . import models, schemas
from passlib.hash import bcrypt


# ----------------------------
#  USER CRUD
# ----------------------------
def create_user(db: Session, user_data: schemas.UserCreate):
    hashed_password = bcrypt.hash(user_data.password)
    db_user = models.User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.User).offset(skip).limit(limit).all()


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        return None

    if user_update.name is not None:
        db_user.name = user_update.name
    if user_update.email is not None:
        db_user.email = user_update.email
    if user_update.password is not None:
        db_user.password = bcrypt.hash(user_update.password)

    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        return None
    db.delete(db_user)
    db.commit()
    return db_user


# ----------------------------
#  POST CRUD
# ----------------------------
def create_post(db: Session, post_data: schemas.PostCreate):
    db_post = models.Post(**post_data.dict())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


def get_post_by_id(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.post_id == post_id).first()


def get_posts(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Post).offset(skip).limit(limit).all()


def update_post(db: Session, post_id: int, post_update: schemas.PostUpdate):
    db_post = db.query(models.Post).filter(models.Post.post_id == post_id).first()
    if not db_post:
        return None

    if post_update.title is not None:
        db_post.title = post_update.title
    if post_update.post_url is not None:
        db_post.post_url = post_update.post_url
    if post_update.content is not None:
        db_post.content = post_update.content

    db.commit()
    db.refresh(db_post)
    return db_post


def delete_post(db: Session, post_id: int):
    db_post = db.query(models.Post).filter(models.Post.post_id == post_id).first()
    if not db_post:
        return None
    db.delete(db_post)
    db.commit()
    return db_post

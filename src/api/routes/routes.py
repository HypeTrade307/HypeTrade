from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from . import crud, models, schemas
from src.db.database import get_db

router = APIRouter()

# -------------------
# POST ROUTES
# -------------------

@router.post("/threads/{thread_id}/posts", response_model=schemas.PostResponse)
async def create_post_for_thread(
    thread_id: int, 
    post: schemas.PostCreate, 
    db: Session = Depends(get_db)
):
    """
    Create a new post in the given thread.
    """
    # first, check if the thread exists
    thread = db.query(models.Thread).filter(models.Thread.thread_id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    # create the post associated with the thread and the user
    new_post = models.Post(
        title=post.title,
        post_url=post.post_url,
        content=post.content,
        thread_id=thread_id,
        author_id=post.author_id,
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return new_post

@router.get("/posts/{post_id}", response_model=schemas.PostResponse)
async def get_post(post_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a post by its ID.
    """
    post = db.query(models.Post).filter(models.Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.put("/posts/{post_id}", response_model=schemas.PostResponse)
async def update_post(post_id: int, post: schemas.PostUpdate, db: Session = Depends(get_db)):
    """
    Update a post by its ID.
    """
    db_post = db.query(models.Post).filter(models.Post.post_id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    # update post attributes if provided in the request
    if post.title is not None:
        db_post.title = post.title
    if post.post_url is not None:
        db_post.post_url = post.post_url
    if post.content is not None:
        db_post.content = post.content

    db.commit()
    db.refresh(db_post)

    return db_post


@app.post("/api/threads", response_model=ThreadResponse)
async def create_thread(thread: ThreadCreate, token: str = Depends(get_current_user)):
    # Logic to create the thread using thread.title and thread.stock_id
    return created_thread
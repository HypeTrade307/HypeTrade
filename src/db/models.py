from sqlalchemy import Column, Float, Integer, String, Table, Text, ForeignKey, Enum, Boolean, TIMESTAMP, VARCHAR
from sqlalchemy.orm import relationship, backref
from .database import Base
import datetime

# ------------------------------------------------------------------
# ASSOCIATION TABLES (For Many-to-Many Relationships)
# ------------------------------------------------------------------

# user_friends: Many-to-many self-referential on "users"
user_friends = Table(
    "user_friends",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True),
    Column("friend_id", Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True),
    Column("status", Enum("pending", "accepted", "blocked", name="friend_status_enum"), server_default="pending")
)

# portfolio_stocks: Many-to-many relationship between portfolios & stocks
portfolio_stocks = Table(
    "portfolio_stocks",
    Base.metadata,
    Column("portfolio_id", Integer, ForeignKey("portfolios.portfolio_id", ondelete="CASCADE"), primary_key=True),
    Column("stock_id", Integer, ForeignKey("stocks.stock_id", ondelete="CASCADE"), primary_key=True),
)

# post_likes: Many-to-many relationship between users & posts
post_likes = Table(
    "post_likes",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", TIMESTAMP, default=datetime.datetime.utcnow)
)

# comment_likes: Many-to-many relationship between users & comments
comment_likes = Table(
    "comment_likes",
    Base.metadata,
    Column("comment_id", Integer, ForeignKey("comments.comment_id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", TIMESTAMP, default=datetime.datetime.utcnow)
)

# ------------------------------------------------------------------
# MAIN TABLES
# ------------------------------------------------------------------

class User(Base):
    """
    The 'users' table. 
    Has relationships:
      - Many-to-many self reference: 'friends'
      - One-to-many: 'posts', 'comments', 'portfolios'
      - Potential relationships to notifications
    """
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)  # hashed password
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # --- Relationships ---
    # Post & Comment
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")

    # Portfolios
    portfolios = relationship("Portfolio", back_populates="owner", cascade="all, delete-orphan")

    # Many-to-many self-referential: friend relationships
    # This will list all "friend" user objects associated via user_friends.
    friends = relationship(
        "User",
        secondary=user_friends,
        primaryjoin=lambda: User.user_id == user_friends.c.user_id,
        secondaryjoin=lambda: User.user_id == user_friends.c.friend_id,
        backref="friend_of"
    )

    # Outgoing & Incoming Notifications
    notifications_sent = relationship("Notification", foreign_keys="[Notification.sender_id]", back_populates="sender", cascade="all, delete-orphan")
    notifications_received = relationship("Notification", foreign_keys="[Notification.receiver_id]", back_populates="receiver", cascade="all, delete-orphan")


class Stock(Base):
    """
    The 'stocks' table.
    Related to:
      - Many threads can reference a given stock
      - Many portfolios can include this stock (through 'portfolio_stocks')
      - Many sentiment analysis entries
    """
    __tablename__ = "stocks"

    stock_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    ticker = Column(String(20), unique=True, nullable=False)
    weight_data = Column(Float, default=0.0)
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # --- Relationships ---
    # Threads referencing this stock
    threads = relationship("Thread", back_populates="stock_ref", cascade="all, delete-orphan")

    # Many-to-many with portfolios
    in_portfolios = relationship(
        "Portfolio",
        secondary=portfolio_stocks,
        back_populates="stocks"
    )

    # Sentiment analysis entries
    sentiments = relationship("SentimentAnalysis", back_populates="stock", cascade="all, delete-orphan")


class Portfolio(Base):
    """
    The 'portfolios' table.
    Belongs to a user, can contain many stocks via 'portfolio_stocks'.
    """
    __tablename__ = "portfolios"

    portfolio_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # --- Relationships ---
    owner = relationship("User", back_populates="portfolios")
    stocks = relationship(
        "Stock",
        secondary=portfolio_stocks,
        back_populates="in_portfolios"
    )


class Forum(Base):
    """
    The 'forums' table. 
    Optional if you have multiple discussion forums.
    """
    __tablename__ = "forums"

    forum_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)

    # --- Relationships ---
    threads = relationship("Thread", back_populates="forum_ref", cascade="all, delete-orphan")


class Thread(Base):
    """
    The 'threads' table.
    Belongs to a forum, a user (creator), and references a stock.
    """
    __tablename__ = "threads"

    thread_id = Column(Integer, primary_key=True, index=True)
    forum_id = Column(Integer, ForeignKey("forums.forum_id", ondelete="SET NULL"))
    creator_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stocks.stock_id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # --- Relationships ---
    forum_ref = relationship("Forum", back_populates="threads", foreign_keys=[forum_id])
    creator = relationship("User", foreign_keys=[creator_id])
    stock_ref = relationship("Stock", back_populates="threads", foreign_keys=[stock_id])

    posts = relationship("Post", back_populates="thread", cascade="all, delete-orphan")


class Post(Base):
    """
    The 'posts' table.
    Belongs to a thread, a user (author), can have many comments, many likes.
    """
    __tablename__ = "posts"

    post_id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("threads.thread_id", ondelete="CASCADE"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    title = Column(Text, nullable=False)
    post_url = Column(VARCHAR(255), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # --- Relationships ---
    thread = relationship("Thread", back_populates="posts")
    author = relationship("User", back_populates="posts")

    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

    # Many-to-many with users: "who liked this post"
    liked_by = relationship(
        "User",
        secondary=post_likes,
        backref="liked_posts"
    )


class Comment(Base):
    """
    The 'comments' table.
    Belongs to a post, a user (author). 
    Can have many likes from users (comment_likes).
    """
    __tablename__ = "comments"

    comment_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)

    # --- Relationships ---
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")

    # Many-to-many with users: "who liked this comment"
    liked_by = relationship(
        "User",
        secondary=comment_likes,
        backref="liked_comments"
    )


class Notification(Base):
    """
    The 'notifications' table.
    A message from one user (sender) to another (receiver).
    """
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    message = Column(String(255), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    is_read = Column(Boolean, default=False)

    # --- Relationships ---
    sender = relationship("User", back_populates="notifications_sent", foreign_keys=[sender_id])
    receiver = relationship("User", back_populates="notifications_received", foreign_keys=[receiver_id])


class SentimentAnalysis(Base):
    """
    The 'sentiment_analysis' table.
    Tracks the sentiment about a particular stock at a given time.
    """
    __tablename__ = "sentiment_analysis"

    sentiment_id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.stock_id", ondelete="CASCADE"), nullable=False)
    sentiment_value = Column(Float, nullable=False)
    raw_string = Column(Text)  # e.g. raw social media text
    weight_data = Column(Float) # optional weighting or confidence
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)

    # --- Relationships ---
    stock = relationship("Stock", back_populates="sentiments")

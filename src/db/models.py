from sqlalchemy import Column, Float, Integer, String, Table, Text, ForeignKey, Enum, Boolean, TIMESTAMP, VARCHAR, func
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

scrapedentry_stocks = Table(
    "scrapedentry_stocks",
    Base.metadata,
    Column("entry_id", Integer, ForeignKey("scraped_reddit_entries.entry_id", ondelete="CASCADE"), primary_key=True),
    Column("stock_id", Integer, ForeignKey("stocks.stock_id", ondelete="CASCADE"), primary_key=True),
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
    username = Column(String(100), nullable=False)
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
      - Many scraped Reddit entries that mention this stock
    """
    __tablename__ = "stocks"

    stock_id = Column(Integer, primary_key=True, index=True)
    stock_name = Column(String(100), nullable=False)
    ticker = Column(String(20), unique=True, nullable=False)
    analysis_mode = Column(Enum("auto", "on_demand", name="analysis_mode_enum"), default="on_demand")
    weight_data = Column(Float, default=0.0)
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Existing relationships
    threads = relationship("Thread", back_populates="stock_ref", cascade="all, delete-orphan")
    in_portfolios = relationship(
        "Portfolio",
        secondary=portfolio_stocks,
        back_populates="stocks"
    )
    sentiments = relationship("SentimentAnalysis", back_populates="stock", cascade="all, delete-orphan")

    # NEW relationship to scraped Reddit entries
    scraped_entries = relationship(
        "ScrapedRedditEntry",
        secondary="scrapedentry_stocks",
        back_populates="mentioned_stocks"
    )


class Portfolio(Base):
    """
    The 'portfolios' table.
    Belongs to a user, can contain many stocks via 'portfolio_stocks'.
    """
    __tablename__ = "portfolios"

    portfolio_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    portfolio_name = Column(String(100), nullable=False)
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
    forum_name = Column(String(100), nullable=False)
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
    __tablename__ = "sentiment_analysis"

    sentiment_id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.stock_id", ondelete="CASCADE"), nullable=False)
    entry_id = Column(Integer, ForeignKey("scraped_reddit_entries.entry_id", ondelete="CASCADE"), nullable=True)
    sentiment_value = Column(Float, nullable=False)
    raw_string = Column(Text)
    created_at = Column(TIMESTAMP, default=func.now())

    # Stock relationship
    stock = relationship("Stock", back_populates="sentiments")

    # OPTIONAL relationship to the entry
    entry = relationship("ScrapedRedditEntry", backref="sentiment_entries")


class ScrapedRedditEntry(Base):
    """
    The 'scraped_reddit_entries' table. 
    Stores raw text from Reddit (posts or comments).
    """
    __tablename__ = "scraped_reddit_entries"

    entry_id = Column(Integer, primary_key=True, index=True)
    reddit_id = Column(String(50), unique=True, nullable=False)  # e.g. "t3_xxx" or "t1_xxx"
    is_comment = Column(Boolean, default=False)
    parent_reddit_id = Column(String(50), nullable=True)         # For comments
    subreddit = Column(String(100), nullable=True)
    author = Column(String(100), nullable=True)
    title = Column(Text, nullable=True)                          # For post title
    content = Column(Text, nullable=True)                        # selftext or comment body
    score = Column(Integer, default=0)
    url = Column(Text, nullable=True)
    created_utc = Column(TIMESTAMP, nullable=True)               # Reddit's own time
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow) # The time we inserted it
    processed_at = Column(TIMESTAMP, nullable=True)              # When we last processed it for sentiment

    # Many-to-many relationship to Stock
    mentioned_stocks = relationship(
        "Stock",
        secondary="scrapedentry_stocks",
        back_populates="scraped_entries"
    )
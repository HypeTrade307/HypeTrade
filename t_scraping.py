# from src.db.database import SessionLocal
# from src.processing.scraping import scrape_subreddit_posts, scrape_comments_for_post, process_unprocessed_entries
# # Start a DB session
# db = SessionLocal()
# print(1)
# # Suppose we have a Stock row for AMD with stock_id=42
# # 1) Scrape the 'stocks' subreddit for 'AMD' keyword
# scrape_subreddit_posts(db, "stocks", "Tesla", stock_id=16)
# print(2)
# # 2) For each new post, also scrape comments if you want
# # You can find the new posts in the DB or from PRAW
# # Example: comment out or adapt
# # scrape_comments_for_post(db, "abc123", stock_id=42)
# print(3)
#
# # 3) Now run the processing function to mark them as processed & store sentiment
# process_unprocessed_entries(db, stock_id=16)
# print(4)
#
# db.close()

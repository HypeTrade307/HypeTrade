from collections import deque
from typing import List
from src.api.routes.users import read_users
from src.db.database import get_db

def search(username: str) -> List[str]:  # Returns a list for JSON serialization
    """
    :param username: username or string to search for within username
    :return: list of usernames, with exact matches at the top || a list with the only entry being 'no matches found'
    """

    matches = deque([user.username for user in read_users(0, 100, next(get_db()))])
    results = deque()
    for i in matches:
        if username == i:
            results.appendleft(i)  # Exact match goes to the front
        elif username in i:
            results.append(i)  # Partial match goes to the back
    if not matches:
        results.append("No matches found")
    return list(results)  # Convert deque to list before returning

# For testing:
# print(search(""))


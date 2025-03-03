from collections import deque
from typing import List

def search(username: str) -> List[str]:  # Returns a list for JSON serialization
    users = ['user2', 'user3', 'user1user2repeat', 'user1']
    
    matches = deque()
    
    for i in users:
        if username == i:
            matches.appendleft(i)  # Exact match goes to the front
        elif username in i:
            matches.append(i)  # Partial match goes to the back

    if not matches:
        matches.append("No matches found")
    
    return list(matches)  # Convert deque to list before returning
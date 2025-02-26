from typing import Deque
def search(username: str) -> Deque[str]:
    users = ['user2', 'user3', 'user1user2repeat', 'user1']
    # This is a placeholder function
    # needs to return:    
    # return [{"word": su.search(word), "length": len(word)+25} for word in data.text.split()]
    matches = Deque([])
    print(username)
    for i in users:
        print(i)
        if username == i:
            matches.appendleft(i)
        elif username in i:
            matches.append(i)
    return matches
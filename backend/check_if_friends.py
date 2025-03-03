user1_fl = ['user2', 'user4']
user2_fl = ['user1', 'user4']
user3_fl = ['user2', 'user4'] # deliberately including user2 to check using flawed data
user4_fl = ['user1', 'user2', 'user3']
users = ['user1', 'user2', 'user3', 'user4']
user_fls = [user1_fl, user2_fl, user3_fl, user4_fl]
current_user = 'user1'
requested_user = 'user3'

# using a dictionary to map users and their attributes, of which right now we only have friendlist

def auto_setup_users(): # indices need to be synced
    user_fl_map=dict()
    print("Auto setting up users")
    for user in users:
        user_fl_map[user] = [{'fl': user_fls[users.index(user)]}] # a list of friends associated with the attribute name fl, within a list wherein outer list is for all attributes
    print(user_fl_map)
    return user_fl_map

user_fl_map = auto_setup_users(users, user_fls)
def check_friends(current_user, requested_user):
    print('Checking if current user {current_user} and requested user {requested_user} are friends')
    if (current_user in user_fl_map.get(requested_user).get('fl') and requested_user in user_fl_map.get(current_user).get('fl')):
        print('Users are friends')
        return user_fl_map.get(current_user).get('fl')
    else:
        print('Users are not friends')
        return None

def remove_from_friendlist(current_user, remove_user):
    print(f'Removing {remove_user} from {current_user}\'s friendlist')
    print("before: ")
    print(user_fl_map.get(current_user).get('fl'))
    print(user_fl_map.get(remove_user).get('fl'))
    if remove_user in user_fl_map.get(current_user).get('fl'):
        user_fl_map.get(current_user).get('fl').remove(remove_user)
        if current_user in user_fl_map.get(remove_user).get('fl'):
            user_fl_map.get(remove_user).get('fl').remove(current_user)
    print("after: ")
    print(user_fl_map.get(current_user).get('fl'))
    print(user_fl_map.get(remove_user).get('fl'))
    return None

def add_to_friendlist(current_user, add_user):
    print(f'Adding {add_user} to {current_user}\'s friendlist')
    print("before: ")
    print(user_fl_map.get(current_user).get('fl'))
    print(user_fl_map.get(add_user).get('fl'))
    if add_user not in user_fl_map.get(current_user).get('fl'):
        user_fl_map.get(current_user).get('fl').append(add_user)
        if current_user not in user_fl_map.get(add_user).get('fl'):
            user_fl_map.get(add_user).get('fl').append(current_user)
    print("after: ")
    print(user_fl_map.get(current_user).get('fl'))
    print(user_fl_map.get(add_user).get('fl'))
    return None

import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend"))) # increasing visibility!

import search_users as su
print(su.search('test'))
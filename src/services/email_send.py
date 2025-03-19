import os
import requests
from dotenv import load_dotenv
import random
load_dotenv()
def send_simple_message(email, code):
    res=requests.post(
        "https://api.mailgun.net/v3/sandboxe0acb649ee224e41932e6be10c59d4b3.mailgun.org/messages",
        auth=("api", os.getenv('MAILGUN_API_KEY', 'MAILGUN_API_KEY')),
        data={"from": f"Mailgun Sandbox <{os.getenv('MAILGUN_SENDING_EMAIL')}>",
              "to": f"Aditya Gandhi <{email}>",
              # replace your own email, name above. name doesn't really matter.
              "subject": "Hello Aditya Gandhi",
              "text": f"Congratulations Aditya Gandhi, you just sent an email with Mailgun! You are truly awesome!\nCode:{code}"})
    print("response:", res)
    print("YOUR CODE:", code)
    return code

# presently billed as junk and unverified :100:
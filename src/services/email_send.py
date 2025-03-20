from __future__ import print_function
from dotenv import load_dotenv
load_dotenv()
import os

'''
import requests

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
'''
# presently billed as junk and unverified :100:

import brevo_python
from brevo_python.rest import ApiException
from pprint import pprint

def send_simple_message(email, code):
    configuration = brevo_python.Configuration()
    configuration.api_key['api-key'] = os.getenv('BREVO_API_KEY')
    configuration.api_key_prefix['partner-key'] = 'Bearer'

    # create an instance of the API class
    api_instance = brevo_python.TransactionalEmailsApi(brevo_python.ApiClient(configuration))
    subject = "from the Python SDK!"
    sender = {"name":"whodis","email":"adityagandhi98101@gmail.com"}
    html_content = f"<html><body><h1>Your code is {code} </h1></body></html>"
    to = [{"email":email,"name":"Jane Doe"}]
    send_smtp_email = brevo_python.SendSmtpEmail(to=to, html_content=html_content, sender=sender, subject=subject) # SendSmtpEmail | Values to send a transactional email
    print(f"Code is {code}. Email may/may not have been sent yet.")
    try:
        # Send a transactional email
        api_response = api_instance.send_transac_email(send_smtp_email)
        pprint(api_response)
    except ApiException as e:
        print("Exception when calling TransactionalEmailsApi->send_transac_email: %s\n" % e)
from __future__ import print_function
from dotenv import load_dotenv
load_dotenv()
import os
import brevo_python
from brevo_python.rest import ApiException
from pprint import pprint

def send_simple_message(email, code):
    """
    uses Brevo API to send a transactional email. api key is in the chat. unless you want to test this particular functionality,
    the code will be printed on the uvicorn terminal after you press 'send code'. only sends stuff from my email for the
    time being; if you'd like to test, contact me and i'll add you to the sender list, and we'll change the sender email
    param to source from .env.
    :param email: email id of recipient user
    :param code: code from auth.py
    :return:
    """

    configuration = brevo_python.Configuration()
    configuration.api_key['api-key'] = os.getenv('BREVO_API_KEY')
    configuration.api_key_prefix['partner-key'] = 'Bearer'

    # create an instance of the API class

    api_instance = brevo_python.TransactionalEmailsApi(brevo_python.ApiClient(configuration))
    subject = "from the Python SDK!"
    sender = {"name":"whodis","email":"adityagandhi98101@gmail.com"}
    html_content = f"<html><body><h1>Your code is {code} </h1></body></html>"
    to = [{"email":email,"name":""}]
    send_smtp_email = brevo_python.SendSmtpEmail(to=to, html_content=html_content, sender=sender, subject=subject) # SendSmtpEmail | Values to send a transactional email

    # The code is printed here for easier access. The mail takes 2-3 minutes to be rec'd.

    print(f"Code is {code}. Email may/may not have been sent yet.")
    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        pprint(api_response)
    except ApiException as e:
        print("Exception when calling TransactionalEmailsApi->send_transac_email: %s\n" % e)
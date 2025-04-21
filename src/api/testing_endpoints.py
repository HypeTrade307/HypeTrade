import requests

def login_and_call_api(
        email="adityagandhi98101@gmail.com",
        password="hohbox-cynze6-defmYx",
        target_url="https://hypet-145797464141.us-central1.run.app/api/auth/login",
        method="login",
        payload=None
):
    """
    :param email: your acc's email address
    :param password: pw
    :param target_url: url 2 query
    :param method: can be get, post or login. if logging in, dont need 2 specify, defaults to login
    :param payload: not implemented. do not specify
    :return:
    """
    # step 1: login and get token
    login_data = {
        "email": email,
        "password": password
    }

    try:
        login_resp = requests.post(
            "https://hypet-145797464141.us-central1.run.app/api/auth/login",
            json=login_data
        )
        login_resp.raise_for_status()
    except requests.RequestException as e:
        print("login failed:", e)
        print("response:", login_resp.text if 'login_resp' in locals() else "no response")
        return

    token = login_resp.json().get("access_token")
    print("✅ logged in. token:", token)

    if method.lower() == "login":
        return  # we're done

    if not token:
        print("⚠️ no token received. cannot proceed with API call.")
        return

    # step 2: prepare headers with token
    headers = {
        "Authorization": f"Bearer {token}"
    }

    # step 3: call the target API endpoint
    try:
        if method.lower() == "get":
            resp = requests.get(target_url, headers=headers)
        elif method.lower() == "post":
            resp = requests.post(target_url, json=payload or {}, headers=headers)
        else:
            print("⚠️ invalid method:", method)
            return

        print(f"📡 response from {target_url}:")
        print(resp.status_code)
        print(resp.json())
    except Exception as e:
        print("api request failed:", e)


# 4 just token:
login_and_call_api()

# 4 doing get to a specific url (can also be post instead)
# login_and_call_api(
#     method="get",
#     target_url="https://hypet-145797464141.us-central1.run.app/api/portfolios/"
# )

# 4 doing a login/post to a specific url [untested!]:
# login_and_call_api(
#     method="post",
#     target_url="https://hypet-145797464141.us-central1.run.app/api/some-post-endpoint",
#     payload={"key": "value"}
# )
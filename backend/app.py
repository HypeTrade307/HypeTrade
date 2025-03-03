from flask import Flask, jsonify

flask_app = Flask(__name__)

@flask_app.route('/')
def home():
    return jsonify({"message": "Hello from Google Cloud Run!"})

if __name__ == '__main__':
    flask_app.run(host='0.0.0.0', port=8080)
from dotenv import load_dotenv
from flask import Flask
from os import environ
from pathlib import Path

ENV_PATH = Path(__file__).parent / 'w3s-dynamic-storage' / '.env'
load_dotenv(ENV_PATH)

DEBUG = True if environ.get('DEBUG') == 'True' else False
HOST = environ.get('HOST') or '0.0.0.0'
PORT = environ.get('PORT') or '3000'

app = Flask(__name__)
from routes import *

def main():
    app.run(host=HOST, port=PORT, debug=DEBUG)

if __name__ == '__main__':
    main()
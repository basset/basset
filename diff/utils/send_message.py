import json
import io
import requests
import hmac
import hashlib


from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

from .settings import *

COMPARED_URL = '{}/build/compared'.format(BASSET_URL)


def send_message(message):
    headers = {'Content-type': 'application/json'}
    json_data = json.dumps(message, separators=(',', ':'))
    request = requests.Request(
        'POST',
        COMPARED_URL,
        data=json_data,
        headers=headers,
    )
    prepped = request.prepare()
    signature = hmac.new(TOKEN.encode(),
                         prepped.body.encode(), digestmod=hashlib.sha256)

    prepped.headers['Sign'] = signature.hexdigest()
    retries = Retry(
        total=5,
        backoff_factor=0.1,
        status_forcelist=[500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retries)
    with requests.Session() as session:
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        response = session.send(prepped)
        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            print("Error: {}".format(e))
        print(response.text)
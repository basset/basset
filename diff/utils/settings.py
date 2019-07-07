import os

BASSET_URL = os.environ.get('BASSET_URL', '')
TOKEN = os.environ.get('TOKEN', '')
AMPQ_HOST = os.environ.get('AMPQ_HOST', '')
S3_ENDPOINT = os.environ.get('S3_ENDPOINT', '')
AMPQ_BUILD_QUEUE = os.environ.get('AMPQ_BUILD_QUEUE', '')
SCREENSHOT_BUCKET = os.environ.get('SCREENSHOT_BUCKET', '')
ASSETS_BUCKET = os.environ.get('ASSETS_BUCKET', '')
COMPARE_TOPIC_ARN = os.environ.get('COMPARE_TOPIC_ARN', '')
COMPARED_TOPIC_ARN = os.environ.get('COMPARED_TOPIC_ARN', '')
SQS_BUILD_QUEUE_URL = os.environ.get('SQS_BUILD_QUEUE_URL',  '')
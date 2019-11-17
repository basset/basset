import os

BASSET_URL = os.environ.get('BASSET_URL', '')
TOKEN = os.environ.get('TOKEN', '')
AMQP_HOST = os.environ.get('AMQP_HOST', '')
S3_ENDPOINT = os.environ.get('S3_ENDPOINT', '')
AMQP_BUILD_QUEUE = os.environ.get('AMQP_BUILD_QUEUE', '')
SCREENSHOT_BUCKET = os.environ.get('SCREENSHOT_BUCKET', '')
ASSETS_BUCKET = os.environ.get('ASSETS_BUCKET', '')
PRIVATE_ASSETS = int(os.environ.get('PRIVATE_ASSETS', 0)) == 1
COMPARE_TOPIC_ARN = os.environ.get('COMPARE_TOPIC_ARN', '')
COMPARED_TOPIC_ARN = os.environ.get('COMPARED_TOPIC_ARN', '')
SQS_BUILD_QUEUE_URL = os.environ.get('SQS_BUILD_QUEUE_URL',  '')
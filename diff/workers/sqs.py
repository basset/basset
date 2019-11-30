import json

import boto3

from render.snapshot import finished
from utils.send_message import send_message
from utils.settings import *
from .process_message import process_message

sqs = boto3.resource('sqs')
queue = sqs.Queue(SQS_BUILD_QUEUE_URL)

print('getting messages')


def get_messages():
    return queue.receive_messages(MaxNumberOfMessages=10, WaitTimeSeconds=10)


messages = get_messages()
print('received messages: {}'.format(len(messages)))
while len(messages) > 0:
    messages = sorted(messages, key=lambda m: json.loads(m.body, encoding='utf-8')['browser'])
    for message in messages:
        message_data = process_message(message.body)
        if message_data is not None:
            send_message(message_data)
            message.delete()

    messages = get_messages()
    print('received more messages: {}'.format(len(messages)))

try:
    finished()
except:
    pass

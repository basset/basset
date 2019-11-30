import boto3
import json
import traceback
from diff.diff import diff_snapshot
from render.snapshot import render_snapshot, finished
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
        try:
            message_data = process_message(message.body)
            send_message(message_data)
            message.delete()
        except Exception as ex:
            print(''.join(traceback.format_exception(etype=type(ex), value=ex, tb=ex.__traceback__)))
            print('There was an error trying to render the snapshot {}'.format(title))
            pass

    messages = get_messages()
    print('received more messages: {}'.format(len(messages)))

try:
    finished()
except:
    pass

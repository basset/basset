import signal
import sys
from contextlib import contextmanager

import pika
from retry import retry

from utils.send_message import send_message
from utils.settings import *
from .process_message import process_message

handling_callback = False
received_signal = False


def handle_signal(signal, frame):
    print("Received signal")
    global received_signal
    received_signal = True
    if not handling_callback:
        print("Not handling task - exiting")
        sys.exit()


signal.signal(signal.SIGTERM, handle_signal)


@contextmanager
def block_signals():
    global handling_callback
    handling_callback = True
    try:
        yield
    finally:
        handling_callback = False
        if received_signal:
            print("Task done - exiting")
            sys.exit()


def consume_message(ch, method, _, body):
    with block_signals:
        message = process_message(body)
        if message is not None:
            send_message(message)
            ch.basic_ack(delivery_tag=method.delivery_tag)


def on_blocked():
    print('Connection blocked')


def on_unblocked():
    print('Connection unblocked')


@retry(pika.exceptions.AMQPConnectionError, delay=5, jitter=(1, 3))
def consume():
    print('Attempting to connect to the server...')
    parameters = pika.URLParameters(
        "{}?blocked_connection_timeout=300".format(AMQP_HOST))
    connection = pika.BlockingConnection(parameters=parameters)
    connection.add_on_connection_blocked_callback(on_blocked)
    connection.add_on_connection_unblocked_callback(on_unblocked)
    channel = connection.channel()

    channel.queue_declare(queue=AMQP_BUILD_QUEUE, durable=True)
    print('Waiting for messages.')

    channel.basic_qos(prefetch_count=5)
    channel.basic_consume(AMQP_BUILD_QUEUE, consume_message)

    try:
        channel.start_consuming()
    except pika.exceptions.ConnectionClosed:
        print('Connection closed')
        pass


if __name__ == "__main__":
    print('Running...')
    consume()

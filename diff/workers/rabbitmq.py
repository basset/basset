import pika
import json

from retry import retry

from diff.diff import diff_snapshot
from render.snapshot import render_snapshot
from utils.send_message import send_message
from utils.settings import *


def setup_queue(task):
    def callback(ch, method, properties, body):
        task(body)
        ch.basic_ack(delivery_tag=method.delivery_tag)

    def on_blocked():
        print('Connection blocked')

    def on_unblocked():
        print('Connection unblocked')

    @retry(pika.exceptions.AMQPConnectionError, delay=5, jitter=(1, 3))
    def consume():
        print('Attempting to connect to the server...')
        parameters = pika.URLParameters(
            "{}?blocked_connection_timeout=300".format(AMPQ_HOST))
        connection = pika.BlockingConnection(parameters=parameters)
        connection.add_on_connection_blocked_callback(on_blocked)
        connection.add_on_connection_unblocked_callback(on_unblocked)
        channel = connection.channel()

        channel.queue_declare(queue=AMPQ_BUILD_QUEUE, durable=True)
        print('Waiting for messages.')

        channel.basic_qos(prefetch_count=5)
        channel.basic_consume(AMPQ_BUILD_QUEUE, callback)

        try:
            channel.start_consuming()
        except pika.exceptions.ConnectionClosed:
            pass

    consume()

def run_task(body):
    data = json.loads(body, encoding='utf-8')
    snapshot_id = data['id']
    source_location = data['sourceLocation']
    organization_id = data['organizationId']
    project_id = data['projectId']
    build_id = data['buildId']
    title = data['title']
    width = data['width']
    browser = data['browser']
    selector = data.get('selector', None)
    hide_selectors = data.get('hideSelectors', None)
    compare_snapshot = data.get('compareSnapshot', None)
    flake_sha_list = data.get('flakeShas', [])

    save_snapshot = compare_snapshot == None

    snapshop_image, image_location = render_snapshot(
        source_location,
        organization_id,
        project_id,
        build_id,
        title,
        width,
        browser,
        selector,
        hide_selectors,
        save_snapshot
    )
    message = {
        'id': data['id'],
    }
    if data.get('compareSnapshot'):
        diff_location, difference, image_location, diff_sha, flake_matched = diff_snapshot(
            snapshop_image,
            organization_id,
            project_id,
            build_id,
            browser,
            title,
            width,
            compare_snapshot,
            flake_sha_list,
            True
        )
        if not flake_matched:
            message['diffLocation'] = diff_location
            message['differenceAmount'] = str(difference)

        message['diffSha'] = diff_sha
        message['difference'] = not flake_matched and difference > 0.1
        message['flakeMatched'] = flake_matched

    message['imageLocation'] = image_location
    send_message(message)


if __name__ == "__main__":
    print('Running...')
    setup_queue(run_task)


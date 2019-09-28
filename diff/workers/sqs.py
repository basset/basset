import boto3
import json
import traceback

from diff.diff import diff_snapshot, get_image
from render.snapshot import render_snapshot, finished
from utils.send_message import send_message
from utils.settings import *
from utils.enum import PROJECT_TYPE


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
		print(message)
		data = json.loads(message.body, encoding='utf-8')

		snapshot_id = data['id']
		project_type = data['type']
		source_location = data['sourceLocation']
		organization_id = data['organizationId']
		project_id = data['projectId']
		build_id = data['buildId']
		title = data['title']
		width = data['width']
		browser = data['browser']
		selector = data.get('selector', None)
		hide_selectors = data.get('hideSelector', None)
		compare_snapshot = data.get('compareSnapshot', None)
		flake_sha_list = data.get('flakeShas', [])

		try:
            message_data = {
				'id': snapshot_id,
			}

			if project_type == PROJECT_TYPE.WEB.value:
			    save_snapshot = compare_snapshot == None
                snapshot_image, image_location = render_snapshot(
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

            if project_type == PROJECT_TYPE.IMAGE.value:
                image_location = source_location
                snapshot_image = get_image(source_location)

			if compare_snapshot:
				diff_location, difference, image_location, diff_hash, flake_matched = diff_snapshot(
					snapshot_image,
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
					message_data['diffLocation'] = diff_location
					message_data['differenceAmount'] = str(difference)

				message_data['diffSha'] = diff_hash
				message_data['difference'] = not flake_matched and difference > 0.1
				message_data['flakeMatched'] = flake_matched

            message_data['imageLocation'] = image_location
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
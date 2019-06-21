import argparse

from diff.diff import diff_snapshot
from render.snapshot import render_snapshot
from utils.send_message import send_message
from utils.settings import *

def run_task(snapshot_id, organization_id, project_id, build_id, source_location, title, width, browser, selector, hide_selectors, compare_snapshot):
    title = ' '.join(title)
    snapshop_image, image_location = render_snapshot(
        source_location,
        organization_id,
        project_id,
        build_id,
        title,
        width,
        browser,
        selector,
        hide_selectors
    )

    message = {
        'id': snapshot_id,
        'imageLocation': image_location
    }
    if compare_snapshot:
        diff_location, difference, image_location, diff_sha, flake_matched = diff_snapshot(
            snapshop_image,
            organization_id,
            project_id,
            build_id,
            browser,
            width,
            [],
            compare_snapshot
        )
        message['diffLocation'] = diff_location
        message['difference'] = 0 if difference == 0 else difference

    send_message(message)
    #publish_message(message, TopicArn=COMPARED_TOPIC_ARN)


if __name__ == "__main__":
    parser = argparse.ArgumentParser('run')
    parser.add_argument('-id', dest='snapshot_id', type=str)
    parser.add_argument('-bid', dest='build_id', type=str)
    parser.add_argument('-pid', dest='project_id', type=str)
    parser.add_argument('-oid', dest='organization_id', type=str)
    parser.add_argument('-source', dest='source_location',  type=str)
    parser.add_argument('-t', dest='title', nargs='*', type=str)
    parser.add_argument('-w', dest='width', type=int)
    parser.add_argument('-b', dest='browser', type=str)
    parser.add_argument('-s', dest='selector', nargs='?', const=None, type=str)
    parser.add_argument('-hs', dest='hide_selectors', nargs='?', const=None, type=str)
    parser.add_argument('-c', dest='compare_snapshot', nargs='?', const=None, type=str)
    args = parser.parse_args()
    run_task(**vars(args))


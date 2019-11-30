import json

from diff.diff import diff_snapshot
from render.snapshot import render_snapshot


def process_message(body):
    data = json.loads(body, encoding='utf-8')
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

    save_snapshot = compare_snapshot is None

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
    message = {
        'id': data['id'],
    }
    if data.get('compareSnapshot'):
        diff_location, difference, image_location, diff_sha, flake_matched = diff_snapshot(
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
            message['diffLocation'] = diff_location
            message['differenceAmount'] = str(difference)

        message['diffSha'] = diff_sha
        message['difference'] = not flake_matched and difference > 0.1
        message['flakeMatched'] = flake_matched

    message['imageLocation'] = image_location

    return message

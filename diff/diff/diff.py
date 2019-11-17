import json
import io
import uuid
import copy
import hashlib

from urllib.parse import urlparse

from utils.settings import *
from utils.s3 import get_file, upload_file, list_files

from .compare import compare


def get_sha1(bytes):
    hash = hashlib.sha1()
    hash.update(bytes)
    return hash.hexdigest()


def diff_snapshot(snapshot, organization_id, project_id, build_id, browser, title, width, compare_snapshot, flake_sha_list, save_snapshot=False):
    snapshot_key = urlparse(compare_snapshot).path.split('/', 2)[2]
    old_snapshot = get_file(snapshot_key)
    diff_snapshot, difference, diff_pixels = compare(old_snapshot, snapshot)
    snapshot_location = compare_snapshot
    key_path = '{}/{}/{}'.format(organization_id, project_id, build_id)

    flake_matched = None
    diff_hash = ''
    diff_location = None
    if difference > 0.1:
        diff_key_path = "{}/diff/{}".format(
            key_path,
            width,
        )
        key = "{}/{}.png".format(
            diff_key_path,
            uuid.uuid4().hex,
        )
        snapshot_stream = io.BytesIO(diff_snapshot)

        diff_hash = get_sha1(diff_snapshot)
        flake_sha_set = set(flake_sha_list)
        flake_matched = diff_hash in flake_sha_set

        # flake_key_matched = match_snapshot_flake(diff_snapshot, flake_key_path)
        # if flake_key_matched:
        #     flake_matched = '{}/{}/{}'.format(S3_ENDPOINT,
        #                                       SCREENSHOT_BUCKET, flake_key_matched)
        if not flake_matched:
            s3image = upload_file(snapshot_stream, key)
            diff_location = '{}/{}/{}'.format(S3_ENDPOINT,
                                              SCREENSHOT_BUCKET, key)

        if save_snapshot:
            file_name = '{}.html'.format(uuid.uuid4().hex)
            image_key = '{}/screenshots/{}/{}/{}.png'.format(
                key_path, browser, width, file_name)
            snapshot.seek(0)
            upload_file(snapshot, image_key)
            snapshot_location = '{}/{}/{}'.format(S3_ENDPOINT,
                                                  SCREENSHOT_BUCKET, image_key)
    else:
        snapshot.close()

    print("Diffed snapshot: [diff: {}] [flake: {}]".format(difference > 0.1, flake_matched))
    return diff_location, difference, snapshot_location, diff_hash, flake_matched

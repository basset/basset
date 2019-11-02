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


def get_image(image_path):
    key = urlparse(image_path).path.split('/', 2)[2]
    return get_file(key)

def diff_snapshot(snapshot, organization_id, project_id, build_id, browser, title, width, compare_snapshot, flake_sha_list, save_snapshot=False):
    old_snapshot = get_image(compare_snapshot)
    diff_snapshot, difference, diff_pixels = compare(old_snapshot, snapshot)
    snapshot_location = compare_snapshot
    key_path = '{}/{}/{}'.format(organization_id, project_id, build_id)

    diff_matched = None
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

    return diff_location, difference, snapshot_location, diff_hash, flake_matched



# def match_snapshot_flake(snapshot_diff, key_path):
#     files = list_files(key_path)
#     sorted_files = sorted(
#         files,
#         key=lambda obj: int(obj.last_modified.strftime('%s')),
#         reverse=True)  # check most recent flakes

#     snapshot_keys = [obj.key for obj in sorted_files]
#     matched_key = None
#     for snapshot_key in snapshot_keys:
#         other_diff = get_file(snapshot_key)
#         snapshot_stream = io.BytesIO(snapshot_diff)
#         _, difference, pixel_diff = compare(other_diff, snapshot_stream)
#         snapshot_stream.close()
#         if pixel_diff == 0:  # exact match (could compare against any flake but could be really slow)
#             matched_key = snapshot_key
#             break
#     print('matched flake {}'.format(matched_key))
#     return matched_key

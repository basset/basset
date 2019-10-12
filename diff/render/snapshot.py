import io
import uuid

from urllib.parse import urlparse
from utils.s3 import upload_file, create_presigned_url
from utils.settings import *

from .render import Render


render = Render()


def render_snapshot(source_location, organization_id, project_id, build_id,
                    title, width, browser, selector, hide_selectors, save_snapshot=True):
    key_path = '{}/{}/{}'.format(organization_id, project_id, build_id)
    snapshot_source_key = urlparse(source_location).path.split('/', 2)[2]
    snapshot_source_url = create_presigned_url(snapshot_source_key)
    if not browser == render.browser and render.browser is not None:
        render.close_browser()
    if not render.is_open:
        render.open_browser(browser)
    try:
        image = render.render(snapshot_source_url, width, selector, hide_selectors)
    except:
        render.close_browser()
        raise

    image_blob = io.BytesIO(image)


    if save_snapshot:
        file_name = '{}.html'.format(uuid.uuid4().hex)
        image_key = '{}/screenshots/{}/{}/{}.png'.format(
        key_path, browser, width, file_name)
        upload_file(image_blob, image_key)
        image_location = '{}/{}/{}'.format(S3_ENDPOINT,
                                           SCREENSHOT_BUCKET, image_key)
    else:
        image_location = None

    return io.BytesIO(image), image_location


def finished():
    render.close_browser()
import io
import json
import unittest
from unittest.mock import patch

from workers.process_message import process_message


@patch('workers.process_message.diff_snapshot')
@patch('workers.process_message.render_snapshot')
class ProcessMessage(unittest.TestCase):

    def setUp(self):
        self.body = {
            "id": "1",
            "sourceLocation": "path/to/image",
            "organizationId": "1",
            "projectId": "2",
            "buildId": "3",
            "title": "test snapshot",
            "width": "1280",
            "browser": "chrome",
            "selector": "",
            "hideSelectors": "",
            "compareSnapshot": False,
            "flakeShas": [
                "0",
                "1",
                "2"
            ]
        }

    def test_process_message_does_not_compare(self, render_snapshot_mock, diff_snapshot_mock):
        image_location = 'http://location_to_image'
        render_snapshot_mock.return_value = io.BytesIO(), image_location
        body = json.dumps(self.body)
        message = process_message(body)

        assert message is not None
        self.assertDictEqual(message, {
            'id': self.body['id'],
            'imageLocation': image_location
        })
        render_snapshot_mock.assert_called()
        diff_snapshot_mock.assert_not_called()

    def test_process_message_compares(self, render_snapshot_mock, diff_snapshot_mock):
        image_location = 'http://location_to_image'
        diff_location = 'http://location_to_diff'
        difference = 0.5
        diff_sha = '10'
        flake_matched = False

        render_snapshot_mock.return_value = io.BytesIO(), None
        diff_snapshot_mock.return_value = diff_location, difference, image_location, diff_sha, flake_matched

        self.body['compareSnapshot'] = True
        body = json.dumps(self.body)
        message = process_message(body)

        assert message is not None
        self.assertDictEqual(message, {
            'id': self.body['id'],
            'imageLocation': image_location,
            'difference': True,
            'differenceAmount': str(difference),
            'diffLocation': diff_location,
            'diffSha': diff_sha,
            'flakeMatched': False,
        })
        render_snapshot_mock.assert_called()
        diff_snapshot_mock.assert_called()

    def test_process_message_flake_matched(self, render_snapshot_mock, diff_snapshot_mock):
        image_location = 'http://location_to_image'
        diff_location = 'http://location_to_diff'
        difference = 0.5
        diff_sha = '10'
        flake_matched = True

        render_snapshot_mock.return_value = io.BytesIO(), None
        diff_snapshot_mock.return_value = diff_location, difference, image_location, diff_sha, flake_matched

        self.body['compareSnapshot'] = True
        body = json.dumps(self.body)
        message = process_message(body)

        assert message is not None
        self.assertDictEqual(message, {
            'id': self.body['id'],
            'imageLocation': image_location,
            'difference': False,
            'diffSha': diff_sha,
            'flakeMatched': True,
        })
        render_snapshot_mock.assert_called()
        diff_snapshot_mock.assert_called()

    def test_process_message_returns_none_when_error(self, render_snapshot_mock, diff_snapshot_mock):
        render_snapshot_mock.side_effect = KeyError("broken")
        render_snapshot_mock.return_value = io.BytesIO(), 'http://location'
        body = json.dumps(self.body)
        message = process_message(body)

        assert message is None
        render_snapshot_mock.assert_called()

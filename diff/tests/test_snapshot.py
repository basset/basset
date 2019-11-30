import io
import json
import os
import sys
import unittest
import uuid
from collections import namedtuple
from render import snapshot
from unittest.mock import patch, Mock, MagicMock
from utils import settings


class RenderSnapshotTest(unittest.TestCase):

    def setUp(self, ):
        snapshot.upload_file = MagicMock(return_value='')
        snapshot.render = MagicMock(
            render=MagicMock(return_value=None),
            browser='firefox',
            close_browser=MagicMock(return_value=None),
            is_open=False,
            open_browser=MagicMock(return_value=None)
        )
        self.source_location = 'path/to/source.html'
        self.organization_id = '1'
        self.project_id = '2'
        self.build_id = '3'
        self.title = 'test snapshot'
        self.width = '1280'
        self.browser = 'firefox'
        self.selector = ''
        self.hide_selectors = ''

    def test_render_snapshot(self):
        image, location = snapshot.render_snapshot(
            self.source_location,
            self.organization_id,
            self.project_id,
            self.build_id,
            self.title,
            self.width,
            self.browser,
            self.selector,
            self.hide_selectors
        )
        assert snapshot.render.render.called
        assert snapshot.render.open_browser.called
        assert not snapshot.render.close_browser.called
        assert image.read() == b''
        self.assertRegex(
            location,
            "/{}/{}/{}/screenshots/firefox/1280/[a-f0-9]+\.html\.png$".format(
                self.organization_id, self.project_id, self.build_id)
        )

    def test_close_browser_not_called(self):
        snapshot.render.browser = None
        image, location = snapshot.render_snapshot(
            self.source_location,
            self.organization_id,
            self.project_id,
            self.build_id,
            self.title,
            self.width,
            'chrome',
            self.selector,
            self.hide_selectors
        )
        assert not snapshot.render.close_browser.called

    def test_open_browser_not_called(self):
        snapshot.render.browser = None
        snapshot.render.is_open = True
        image, location = snapshot.render_snapshot(
            self.source_location,
            self.organization_id,
            self.project_id,
            self.build_id,
            self.title,
            self.width,
            'chrome',
            self.selector,
            self.hide_selectors
        )
        assert not snapshot.render.open_browser.called
        assert not snapshot.render.close_browser.called

    def test_close_browser_is_called_when_browser_changes(self):
        image, location = snapshot.render_snapshot(
            self.source_location,
            self.organization_id,
            self.project_id,
            self.build_id,
            self.title,
            self.width,
            'chrome',
            self.selector,
            self.hide_selectors
        )
        assert snapshot.render.close_browser.called

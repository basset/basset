import os
import unittest
from unittest.mock import patch, MagicMock

from render.render import Render, webdriver

dir_path = os.path.dirname(os.path.realpath(__file__))

BASE64_HTML_MAX_HEIGHT = 'data:text/html;base64,PGh0bWw+DQo8aGVhZD4NCjxsaW5rIGhyZWY9Imh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzP2ZhbWlseT1Sb2JvdG8iIHJlbD0ic3R5bGVzaGVldCI+DQo8c3R5bGU+DQpkaXYsIGJvZHksICogew0KZm9udC1mYW1pbHk6ICdSb2JvdG8nOw0KfQ0KPC9zdHlsZT4NCjwvaGVhZD4NCjxib2R5Pg0KPGRpdiBzdHlsZT0icG9zaXRpb246IGFic29sdXRlOyBoZWlnaHQ6IDIwMDBweDsgdG9wOiAwOyBsZWZ0OiAwIj5UZXN0aW5nPC9kaXY+DQo8L2JvZHk+DQo8L2h0bWw+'
BASE64_HTML_SELECTOR = 'data:text/html;base64,PGh0bWw+DQo8aGVhZD4NCjxsaW5rIGhyZWY9Imh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzP2ZhbWlseT1Sb2JvdG8iIHJlbD0ic3R5bGVzaGVldCI+DQo8c3R5bGU+DQpkaXYsIGJvZHksICogew0KZm9udC1mYW1pbHk6ICdSb2JvdG8nOw0KfQ0KPC9zdHlsZT4NCjwvaGVhZD4NCjxib2R5IHN0eWxlPSJoZWlnaHQ6IDIwMDBweDsgd2lkdGg6IDEyODBweDsiPg0KPGRpdiBpZD0idGVzdC1tZSIgc3R5bGU9ImhlaWdodDogNTAwcHg7IHdpZHRoOiA4MDBweDsiPlRlc3Rpbmc8L2Rpdj4NCjxkaXYgaWQ9ImRvLW5vdC10ZXN0LW1lIiBzdHlsZT0iaGVpZ2h0OiAyNTAwcHg7IHdpZHRoOiAyMDAwcHg7Ij5EbyBub3QgdGVzdCBtZTwvZGl2Pg0KPC9ib2R5Pg0KPC9odG1sPg=='


class RenderTest(unittest.TestCase):

    def setUp(self):
        self.render = Render()

    def test_options(self):
        chrome_options = ['--headless', '--window-size=1280x1024',
                          '--hide-scrollbars', '--no-sandbox']
        self.assertListEqual(
            self.render.chrome_options.arguments, chrome_options)
        firefox_options = ['-headless', '--width 1280']
        self.assertListEqual(
            self.render.firefox_options.arguments, firefox_options)

        self.assertFalse(self.render.is_open)
        self.assertIsNone(self.render.browser)

    @patch.object(webdriver, 'Firefox', MagicMock(options=None))
    def test_open_with_firefox(self):
        self.render.open_browser('firefox')

        self.assertTrue(self.render.is_open)
        self.assertEqual(self.render.browser, 'firefox')
        assert webdriver.Firefox.called

    @patch.object(webdriver, 'Chrome', MagicMock(options=None))
    def test_open_with_chrome(self):
        self.render.open_browser('chrome')

        self.assertTrue(self.render.is_open)
        self.assertEqual(self.render.browser, 'chrome')
        assert webdriver.Chrome.called

    @patch.object(webdriver, 'Chrome', MagicMock(options=None, quit=MagicMock()))
    def test_close_browser(self):
        self.render.open_browser('chrome')
        self.render.close_browser()

        self.assertFalse(self.render.is_open)
        self.assertEqual(self.render.browser, 'chrome')
        assert self.render.driver.quit.called

    def test_set_max_height(self):
        self.render.open_browser('chrome')
        self.render.driver.get(BASE64_HTML_MAX_HEIGHT)
        height = self.render.get_max_height()
        self.assertEqual(height, 2000)

    def test_render_selector(self):
        self.render.open_browser('chrome')
        image = self.render.render(
            BASE64_HTML_SELECTOR, '1280', '#test-me', '')
        # with open(os.path.join(dir_path, 'images', 'rendered-selector.png'), 'wb') as write_file:
        #     write_file.write(image)
        with open(os.path.join(dir_path, 'selector.png'), 'rb') as file:
            png_data = file.read()
        self.assertEqual(png_data, image)

    def test_render_hide_selector(self):
        self.render.open_browser('chrome')
        image = self.render.render(
            BASE64_HTML_SELECTOR, '1280', '', '#do-not-test-me')
        # with open(os.path.join(dir_path, 'images', 'rendered-hide-selector.png'), 'wb') as write_file:
        #     write_file.write(image)
        with open(os.path.join(dir_path, 'hide-selector.png'), 'rb') as file:
            png_data = file.read()
        self.assertEqual(png_data, image)


if __name__ == '__main__':
    unittest.main()

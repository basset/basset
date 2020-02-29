import time
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException, JavascriptException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait


class Render(object):
    def __init__(self):
        self.height = 1024
        self.width = 1280
        self.firefox_options = webdriver.firefox.options.Options()
        self.firefox_options.headless = True
        self.firefox_options.add_argument('--width {}'.format(self.width))
        # self.firefox_profile = webdriver.FirefoxProfile(profile_directory='/tmp')
        # self.firefox_profileDEFAULT_PREFERENCES['frozen']['javascript.enabled'] = False

        self.chrome_options = webdriver.chrome.options.Options()
        self.chrome_options.headless = True
        self.chrome_options.add_argument(
            "--window-size={}x{}".format(self.width, self.height))
        self.chrome_options.add_argument(
            "--hide-scrollbars")

        self.chrome_options.add_argument('--no-sandbox')
        self.is_open = False
        self.browser = None
        self.driver = None

    def open_browser(self, browser):
        print('opening {}'.format(browser))
        self.browser = browser
        self.is_open = True
        if browser == 'firefox':
            self.driver = webdriver.Firefox(service_log_path='/tmp/firefox.log', options=self.firefox_options)
        if browser == 'chrome':
            self.driver = webdriver.Chrome(service_log_path='/tmp/chrome.log', options=self.chrome_options)
        if browser == 'ie':
            self.driver = webdriver.Ie()
        if browser == 'edge':
            self.driver = webdriver.Edge()

    def close_browser(self):
        self.is_open = False
        self.driver.quit()

    def get_max_height(self):
        height = self.height
        try:
            height = int(
                self.driver.execute_script(
                    """
                    let height = 0;
                    Array.prototype.slice.call(document.querySelectorAll('*')).forEach(function (e) {
                        let rect = e.getClientRects();
                        if (rect.length > 0) {
                            const style = window.getComputedStyle(e);
                            let marginTop = parseInt(style.marginTop || 0);
                            let marginBottom = parseInt(style.marginBottom || 0);
                            let calcHeight = rect[0].top + rect[0].height + marginTop + marginBottom;
                            if (calcHeight > height) {
                                height = calcHeight;
                            }
                        }
                    });
                    return height;
                    """
                )
            )
        except JavascriptException as ex:
            print("Error setting height: {}".format(ex.msg))
            pass
        return height

    def hide_elements(self, selectors):
        try:
            self.driver.execute_script(
                """
                let hideSelectors = arguments[0];
                let hideStyle = document.createElement('style');
                hideStyle.innerText = hideSelectors + ' { visibility: hidden };';
                document.body.insertBefore(hideStyle, document.body.childNodes[0]);
                return hideStyle.innerText;
                """,
                selectors
            )
        except JavascriptException as ex:
            print("Error hiding elements: {}".format(ex.msg))
            pass

    # transform:
    # -o-transform: none !important;-moz-transform: none !important;-ms-transform: none !important;-webkit-transform: none !important;transform: none !important
    # might not be an actual animation
    def hide_animations(self):
        try:
            self.driver.execute_script(
                """
                let animationStyle = document.createElement('style');
                animationStyle.innerText = "* {-o-transition-property: none !important;-moz-transition-property: none !important;-ms-transition-property: none !important;-webkit-transition-property: none !important;transition-property: none !important;;-webkit-animation: none !important;-moz-animation: none !important;-o-animation: none !important;-ms-animation: none !important;animation: none !important;}"
                document.body.insertBefore(animationStyle, document.body.childNodes[0]);
                """
            )
        except JavascriptException as ex:
            print("Error hiding animations: {}".format(ex.msg))
            pass

    def get_ready_state(self):
        ready_state = False
        try:
            ready_state = self.driver.execute_script(
                "return document.readyState;"
            )
        except JavascriptException as ex:
            print("Error checking page load: {}".format(ex.msg))
            pass
        return ready_state

    def render(self, location, width, selector, hide_selectors):
        self.driver.get(location)
        self.driver.set_window_size(width, self.height)

        self.hide_animations()

        WebDriverWait(self.driver, 5).until(
            lambda driver: self.get_ready_state() == 'complete'
        )

        height = self.get_max_height()

        if self.browser == 'firefox':
            height += 84
        if self.browser == 'ie':
            height += 86
        if self.browser == 'edge':
            height += 134
        print('setting window to height {}'.format(height))
        self.driver.set_window_size(width, height)

        selectors_to_hide = []
        if hide_selectors:
            for hide_selector in hide_selectors.split(','):
                trimmed = hide_selector.strip()
                if trimmed != '':
                    selectors_to_hide.append(trimmed)

        if len(selectors_to_hide) > 0:
            print('hiding selectors: {}'.format(hide_selectors))
            self.hide_elements(hide_selectors)

        if selector is not None and selector.strip() != '':
            try:
                element = self.driver.find_element_by_css_selector(selector)
                print('using selector: {}'.format(selector))
                return element.screenshot_as_png
            except NoSuchElementException:
                print('No element found: {}'.format(selector))
                pass

        return self.driver.get_screenshot_as_png()

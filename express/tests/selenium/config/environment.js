const fs = require('fs');
const path = require('path');
const os = require('os');
const NodeEnvironment = require('jest-environment-node');
const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');
const Snapshots = require('./snapshots');

const DIR = path.join(os.tmpdir(), 'jest_selenium_global_setup');

class WebdriverEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
    this.chromeOptions = new chrome.Options().headless();

    this.firefoxOptions = new firefox.Options().headless();

    this.configuration = {
      forBrowser: 'firefox',
      chromeOptions: this.chromeOptions,
      firefoxOptions: this.firefoxOptions,
      ...config.testEnvironmentOptions,
    };
    this.global.configuration = this.configuration;
  }

  async setup() {
    await super.setup();
    const config = JSON.parse(
      fs.readFileSync(path.join(DIR, 'config.json'), 'utf8'),
    );
    this.global.address = config.address;
    this.global.driver = await buildDriver(this.global.configuration);
    this.global.By = webdriver.By;
    this.global.until = webdriver.until;
    this.byTestId = testId => webdriver.By.css(`[data-test-id="${testId}"]`);
    this.global.scrollIntoView = async element => {
      await this.global.driver.executeScript(
        'arguments[0].scrollIntoView(true);',
        element,
      );
      this.global.driver.sleep(300);
    };
    this.global.waitForTestId = (testId, time) =>
      this.global.driver.wait(
        webdriver.until.elementLocated(this.byTestId(testId)),
        time,
      );
    this.global.findAllByTestId = testId =>
      this.global.driver.findElements(this.byTestId(testId));
    this.global.findByTestId = testId =>
      this.global.driver.findElement(this.byTestId(testId));
    this.global.waitForNotification = async () => {
      await this.global.driver.wait(
        webdriver.until.elementLocated(this.byTestId('close-notification')),
      );
      await this.global.driver.sleep(200);
    };
    this.global.waitForLoader = async () => {
      const loader = (await this.global.findAllByTestId('loader'))[0];
      if (loader) {
        return this.global.driver.wait(webdriver.until.stalenessOf(loader));
      }
    };
    this.global.cleanup = async () => {
      this.global.driver.quit();
      this.global.driver = await buildDriver(this.configuration);
    };
    this.global.snapshot = async (
      title,
      { widths, browsers, hideSelectors, selectors },
    ) => {
      let source = await this.global.driver.executeScript(
        'return document.documentElement.outerHTML;',
      ); //getPageSource escapes some style values

      source = source.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        '',
      );
      await Snapshots.snapshot({
        source,
        title,
        widths,
        browsers,
        hideSelectors,
        selectors,
      });
    };
  }

  async teardown() {
    if (this.global.driver) {
      try {
        await this.global.driver.quit();
      } catch (error) {
        console.error(error);
      }
    }
    await super.teardown();
  }
}

async function buildDriver(configuration, server) {
  return new webdriver.Builder()
    .forBrowser(configuration.forBrowser)
    .setChromeOptions(configuration.chromeOptions)
    .setFirefoxOptions(configuration.firefoxOptions)
    .build();
}

module.exports = WebdriverEnvironment;

const login = async (driver, username, password) => {
  await driver.get(`http://localhost:${address.port}/login`);
  const submitButton = await driver.findElement(
    By.css('[data-test-id="test-submit"]'),
  );
  const emailInput = await driver.findElement(
    By.css('[data-test-id="test-email"]'),
  );
  await emailInput.sendKeys(username);
  const passwordInput = await driver.findElement(
    By.css('[data-test-id="test-password"]'),
  );
  await passwordInput.sendKeys(password);
  await submitButton.click();
  return driver.wait(until.urlIs(`http://localhost:${address.port}/`), 1000);
};

module.exports = {
  login,
};

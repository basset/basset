const { createUser } = require('../utils/user');

describe('login page', () => {
  test('login', async () => {
    await driver.get(`http://localhost:${address.port}/login`);
    expect(await driver.getTitle()).toBe('Basset • Log In');

    await snapshot('Login page', { widths: '1280' });

    const submitButton = await findByTestId('test-submit');
    await submitButton.click();

    await snapshot('Login page - errors', { widths: '1280' });

    const emailInput = await findByTestId('test-email');
    await emailInput.sendKeys('tester@basset.io');
    const passwordInput = await findByTestId('test-password');
    await passwordInput.sendKeys('tester');

    await snapshot('Login page - filled input', { widths: '1280' });

    await submitButton.click();
    await waitForTestId('login-error');

    await snapshot('Login page - invalid credentials', {
      widths: '1280, 720, 360',
    });
  });
});

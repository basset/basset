const { createUser } = require('../utils/user');

describe('forgot password page', async () => {
  let user;
  beforeAll(async () => {
    user = await createUser('forgot@basset.io', {
      name: 'Tester tester',
      password: 'basset',
      active: true,
    });
  });
  test('forgot password', async () => {
    await driver.get(`http://localhost:${address.port}/forgot`);
    await waitForLoader();
    await snapshot('Forgot password page', { widths: '1280' });
    const emailInput = await findByTestId('forgot-email-input');
    await emailInput.sendKeys('tester@basset.io');
    await snapshot('Forgot password page - filled input', { widths: '1280' });
    const submit = await findByTestId('forgot-submit');
    await submit.click();
    await waitForTestId('forgot-success');
    await snapshot('Forgot password page - sent', { widths: '1280' });
  });
});

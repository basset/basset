const { generateToken } = require('../../app/utils/auth/token');
const { encode } = require('../../app/utils/safe-base64');
const { createUser } = require('../utils/user');

describe('reset password page', async () => {
  let user, uidb64, token;
  beforeAll(async () => {
    user = await createUser('reset@basset.io', {
      name: 'Tester tester',
      password: 'basset',
      active: true,
    });
    uidb64 = encode(user.id);
    token = generateToken(user);
  });
  test('valid password token', async () => {
    await driver.get(
      `http://localhost:${address.port}/reset/${uidb64}/${token}`,
    );
    await waitForLoader();
    await snapshot('Reset password', { widths: '1280' });
    const passwordInput = await findByTestId('reset-password-input');
    await passwordInput.sendKeys('newbasset');
    const submit = await findByTestId('reset-password-submit');
    await submit.click();
    await waitForTestId('success');
    await snapshot('Reset password - success', { widths: '1280' });
  });
  test('invalid password token', async () => {
    await driver.get(
      `http://localhost:${address.port}/reset/${uidb64}/${token}`,
    );
    await waitForLoader();
    await waitForTestId('error');
    await snapshot('Reset password - error', { widths: '1280' });
  });
});

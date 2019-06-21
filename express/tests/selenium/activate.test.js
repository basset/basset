const { generateToken } = require('../../app/utils/auth/token');
const { encode } = require('../../app/utils/safe-base64');
const { createUser } = require('../utils/user');

describe('activate page', async () => {
  let user, uidb64, token;
  beforeAll(async () => {
    user = await createUser('activate@basset.io', {
      name: 'Tester tester',
      password: 'basset',
      active: false,
    });
    uidb64 = encode(user.id);
    token = generateToken(user);
  });
  test('activate', async () => {
    await driver.get(
      `http://localhost:${address.port}/activate/${uidb64}/${token}`,
    );
    await waitForLoader();
    const success = await findByTestId('success');
    expect(await success.getText()).toBe('Your account has been activated');
    await snapshot('Activated page - success', { widths: '1280' });
    await driver.get(`http://localhost:${address.port}/logout`);
  });
  test('invalid activation', async () => {
    await driver.get(
      `http://localhost:${address.port}/activate/${uidb64}/${token}`,
    );
    await waitForLoader();
    const error = await findByTestId('error');
    expect(await error.getText()).toBe('Cannot activate');
    await snapshot('Activation page - error', { widths: '1280' });
  });
});

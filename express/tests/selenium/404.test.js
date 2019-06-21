const { createUser } = require('../utils/user');
const { login } = require('./utils/auth');

describe('404 page', () => {
  let user;
  beforeAll(async () => {
    user = await createUser('404@basset.io', {
      password: 'basset',
      active: true,
    });
  });
  test('404 page', async () => {
    await login(driver, '404@basset.io', 'basset');
    await driver.get(`http://localhost:${address.port}/thisdoesnotexist`);
    await waitForLoader();
    await driver.wait(async () => {
      const title = await driver.getTitle();
      return title === 'Basset • 404 Not found';
    });
    const homeButton = await findByTestId('go-home');
    await snapshot('404 page', { widths: '1280' });
    expect(await homeButton.getAttribute('href')).toBe(
      `http://localhost:${address.port}/`,
    );
  });
});

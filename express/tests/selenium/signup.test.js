describe('signup page', async () => {
  test('signup', async () => {
    await driver.get(`http://localhost:${address.port}/signup`);
    await waitForLoader();
    await snapshot('Signup page', { widths: '1280' });
    const nameInput = await findByTestId('signup-name-input');
    await nameInput.sendKeys('lester');
    const emailInput = await findByTestId('signup-email-input');
    await emailInput.sendKeys('signup@basset.io');
    const passwordInput = await findByTestId('signup-password-input');
    await passwordInput.sendKeys('tester');
    await snapshot('Signup page - filled input', { widths: '1280' });
    const submit = await findByTestId('signup-submit');
    await submit.click();
    await waitForTestId('signup-success');

    await snapshot('Signup page - account created', { widths: '1280' });
  });
});

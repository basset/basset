const { createUser } = require('../utils/user');
const { login } = require('./utils/auth');

describe('404 page', () => {
  let user;
  beforeAll(async () => {
    user = await createUser('profile@basset.io', {
      password: 'basset',
      active: true,
    });
  });
  test('404 page', async () => {
    await login(driver, 'profile@basset.io', 'basset');
    await driver.get(`http://localhost:${address.port}/profile`);
    await waitForLoader();
    await driver.wait(async () => {
      const title = await driver.getTitle();
      return title === 'Basset • Profile';
    });
    await snapshot('profile page', { widths: '1280' });

    const getEditName = () => findByTestId('edit-profile-name');
    let editName = await getEditName();
    await editName.click();
    const getNameInput = () => findByTestId('profile-name-input');
    const cancelButton = await findByTestId('profile-name-cancel');

    let nameInput = await getNameInput();
    await nameInput.sendKeys('Tester tested');
    await snapshot('profile page - edit name', { widths: '1280' });
    await cancelButton.click();

    editName = await getEditName();
    await editName.click();
    nameInput = await getNameInput();
    const saveButton = await findByTestId('profile-name-save');

    expect(nameInput.getAttribute('value')).not.toBe('Tester tested');
    await nameInput.sendKeys('Profile Profile');
    await saveButton.click();
    editName = await getEditName();
    await driver.wait(until.elementIsEnabled(editName));
  });
});

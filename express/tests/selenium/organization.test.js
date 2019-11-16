const { createUser } = require('../utils/user');
const { createInvite } = require('../utils/invite');
const { addUserToOrganization } = require('../utils/organization');
const { login } = require('./utils/auth');

describe('organizations', () => {
  let user;
  const organizationUrl = `http://localhost:${address.port}/organizations`;
  beforeAll(async () => {
    user = await createUser('organization@basset.io', {
      password: 'basset',
      active: true,
      name: 'Mr Mr',
    });
  });
  test('organization', async () => {
    await login(driver, 'organization@basset.io', 'basset');
    await waitForLoader();
    const createOrganizationLink = await findByTestId('create-organization');

    await createOrganizationLink.click();

    await snapshot('Create organization page', { widths: '1280' });
    const organizationName = await findByTestId(
      'create-organization-name-input',
    );

    await organizationName.sendKeys('Basset test');

    const submit = await findByTestId('create-organization-submit');
    await submit.click();
    await driver.wait(until.urlIs(`http://localhost:${address.port}/`));

    await driver.get(organizationUrl);
    await waitForLoader();
    await waitForTestId('member-dropdown');
    await snapshot('Organization page', {
      widths: '1280',
      hideSelectors: '[data-test-id="ignore-element"]',
    });

    let editOrganization = await findByTestId('edit-organization-name');

    await editOrganization.click();
    const organizationNameField = await findByTestId('organization-name-input');

    await organizationNameField.sendKeys(' site');
    const saveName = await findByTestId('organization-name-save');

    await saveName.click();

    editOrganization = await findByTestId('edit-organization-name');
    await driver.wait(until.elementIsEnabled(editOrganization));
  });
  test('members', async () => {
    const newUser = await createUser('organization2@basset.io', {
      name: 'Jimmy McJimmy',
    });
    const org = await user.$relatedQuery('organizations').first();
    let member = await addUserToOrganization(org.id, newUser.id);
    await driver.get(organizationUrl);
    await waitForLoader();
    await waitForTestId('member-dropdown');
    let memberDropdown = await findAllByTestId('member-dropdown');
    expect(memberDropdown).toHaveLength(2);
    await memberDropdown[1].click();

    let toggleActive = await findByTestId('toggle-active');
    await toggleActive.click();
    await driver.wait(until.stalenessOf(toggleActive));
    member = await member.$query();
    expect(member.active).toBe(false);

    await memberDropdown[1].click();
    toggleActive = await findByTestId('toggle-active');
    await toggleActive.click();
    await driver.wait(until.stalenessOf(toggleActive));
    member = await member.$query();
    expect(member.active).toBe(true);

    await memberDropdown[1].click();
    let toggleAdmin = await findByTestId('toggle-admin');
    await toggleAdmin.click();
    await driver.wait(until.elementIsEnabled(memberDropdown[1]));
    await driver.sleep(100);
    member = await member.$query();
    expect(member.admin).toBe(true);

    await memberDropdown[1].click();
    toggleAdmin = await findByTestId('toggle-admin');
    await toggleAdmin.click();
    await driver.wait(until.elementIsEnabled(memberDropdown[1]));
    member = await member.$query();
    expect(member.admin).toBe(false);
    await snapshot('Member added', {
      widths: '1280',
      hideSelectors: '[data-test-id="ignore-element"]',
    });

    await memberDropdown[1].click();
    const removeMember = await findByTestId('remove-member');
    await removeMember.click();

    const confirmRemove = await findByTestId('confirm-remove-member');
    const cancelRemove = await findByTestId('cancel-remove-member');
    await snapshot('Remove member dialog', {
      widths: '1280',
      hideSelectors: '[data-test-id="ignore-element"]',
    });
    confirmRemove.click();
    await driver.wait(until.stalenessOf(confirmRemove));
    memberDropdown = await findAllByTestId('member-dropdown');
    expect(memberDropdown).toHaveLength(1);
  });
  test('invites', async () => {
    let inviteTab = await findByTestId('invites');
    await inviteTab.click();
    await waitForLoader();

    const inviteMemberBtn = await findByTestId('invite-member');
    await inviteMemberBtn.click();

    await snapshot('Invite member dialog', { widths: '1280' });
    await snapshot('Invite member dialog box', {
      selectors: '[data-test-id="invite-member-dialog"]',
    });

    const inviteEmailInput = await findByTestId('invite-email-input');
    inviteEmailInput.sendKeys('invite@basset.io');
    const confirmInvite = await findByTestId('confirm-invite-member');
    const cancelInvite = await findByTestId('cancel-invite-member');
    await confirmInvite.click();
    await driver.wait(until.stalenessOf(confirmInvite));
    await waitForTestId('invite-dropdown');

    let inviteDropdown = await findAllByTestId('invite-dropdown');
    expect(inviteDropdown).toHaveLength(1);
    await inviteDropdown[0].click();
    const resendInvite = await findByTestId('resend-invite');
    await resendInvite.click();
    await waitForNotification();
    const closeNotification = await findByTestId('close-notification');
    await closeNotification.click();
    await driver.wait(until.stalenessOf(closeNotification));

    await snapshot('Invites', {
      widths: '1280',
      hideSelectors: '[data-test-id="ignore-element"]',
    });
    await inviteDropdown[0].click();
    const deleteInvite = await findByTestId('delete-invite');
    await deleteInvite.click();
    const confirmDelete = await findByTestId('confirm-delete-invite');
    await snapshot('Delete invite dialog', {
      widths: '1280',
      hideSelectors: '[data-test-id="ignore-element"]',
    });
    const cancelDelete = await findByTestId('cancel-delete-invite');
    await confirmDelete.click();

    await driver.wait(until.stalenessOf(confirmDelete));

    inviteDropdown = await findAllByTestId('invite-dropdown');
    expect(inviteDropdown).toHaveLength(0);
  });
});

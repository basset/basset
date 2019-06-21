const User = require('../../../app/models/User');
const settings = require('../../../app/settings');

const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createUser } = require('../../utils/user');

describe('User', () => {
  let user, user2, otherUser;
  let organization, otherOrganization;

  beforeAll(async () => {
    user = await createUser('user@usermodel.io');
    organization = await createOrganization('organization');
    await addUserToOrganization(organization.id, user.id, true);
    user = await user.$query().eager('organizations');

    user2 = await createUser('user2@usermodel.io');
    await addUserToOrganization(organization.id, user2.id, false);
    user2 = await user2.$query().eager('organizations');

    otherUser = await createUser('user@usermodel2.io');
    otherOrganization = await createOrganization('organization2');
    await addUserToOrganization(otherOrganization.id, otherUser.id, true);
    otherUser = await otherUser.$query().eager('organizations');
  });

  test('canRead', async () => {
    expect(await user.canRead(user)).toBe(true);
    expect(await user.canRead(otherUser)).toBe(false);
    expect(await user2.canRead(user)).toBe(true);
    expect(await user2.canRead(otherUser)).toBe(false);
    expect(await otherUser.canRead(otherUser)).toBe(true);
    expect(await otherUser.canRead(user)).toBe(false);
  });

  test.each([['canDelete'], ['canEdit']])('%s', async fn => {
    expect(await user[fn](user)).toBe(true);
    expect(await user2[fn](user)).toBe(false);
    expect(await user[fn](user2)).toBe(false);
    expect(await user2[fn](user2)).toBe(true);
    expect(await otherUser[fn](user2)).toBe(false);
    expect(await otherUser[fn](user)).toBe(false);
    expect(await otherUser[fn](otherUser)).toBe(true);
  });

  test('authorizationFilter', async () => {
    const currentUsers = [
      { ...user, organizations: undefined },
      { ...user2, organizations: undefined },
    ];
    const users = await User.authorizationFilter(user);
    expect(users).toEqual(expect.arrayContaining(currentUsers));
    expect(await User.authorizationFilter(user2)).toEqual(users);
    expect(await User.authorizationFilter(otherUser)).toEqual([
      { ...otherUser, organizations: undefined },
    ]);
  });

  test('isAdmin', async () => {
    expect(await user.isAdmin(organization.id)).toBe(true);
    expect(await user2.isAdmin(organization.id)).toBe(false);
    expect(await otherUser.isAdmin(organization.id)).toBe(false);
    expect(await otherUser.isAdmin(otherOrganization.id)).toBe(true);
  });

  test('canCreateOrganizations', async () => {
    expect(await user.canCreateOrganizations()).toBe(true);
    expect(await user2.canCreateOrganizations()).toBe(true);
    expect(await otherUser.canCreateOrganizations()).toBe(true);

    settings.site.private = true;
    expect(await user.canCreateOrganizations()).toBe(false);
    expect(await user2.canCreateOrganizations()).toBe(false);
    expect(await otherUser.canCreateOrganizations()).toBe(false);

    user.admin = true;
    expect(await user.canCreateOrganizations()).toBe(true);
  });

  test('hashes password on creation', async () => {
    const newUser = createUser('newuser@usermodel.io', { password: 'test' });
    expect(newUser.password).not.toBe('test');
  });

  test('changePassword', async () => {
    const oldHash = user.password;
    await user.changePassword('changed');
    user = user.$query();
    expect(user.password).not.toBe('changed');
    expect(user.password).not.toBe(oldHash);
  });
});

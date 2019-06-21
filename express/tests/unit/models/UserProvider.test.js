const UserProvider = require('../../../app/models/UserProvider');

const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createUser, createUserProvider } = require('../../utils/user');

describe('UserProvider', () => {
  let user, user2, otherUser;
  let provider, provider2, otherProvider;
  let member, member2, otherMember;
  let organization, otherOrganization;

  beforeAll(async () => {
    user = await createUser('user@userprovider.io');
    organization = await createOrganization('organization');
    await addUserToOrganization(organization.id, user.id, true);
    user = await user.$query().eager('organizations');
    provider = await createUserProvider(user.id, {
      provider: 'github',
      providerId: '1234',
      token: 'oo',
    });

    user2 = await createUser('user2@userprovider.io');
    await addUserToOrganization(organization.id, user2.id, false);
    user2 = await user2.$query().eager('organizations');
    provider2 = await createUserProvider(user2.id, {
      provider: 'github',
      providerId: '12345',
      token: '',
    });

    otherUser = await createUser('user@userprovider2.io');
    otherOrganization = await createOrganization('organization2');
    await addUserToOrganization(otherOrganization.id, otherUser.id, true);
    otherUser = await otherUser.$query().eager('organizations');
    otherProvider = await createUserProvider(otherUser.id, {
      provider: 'github',
      providerId: '123456',
      token: '',
    });
  });

  test('authorizationFilter', async () => {
    const providers = await UserProvider.authorizationFilter(user);
    expect(providers).toEqual(expect.arrayContaining([provider, provider2]));
    expect(await UserProvider.authorizationFilter(user2)).toEqual(providers);
    expect(await UserProvider.authorizationFilter(otherUser)).toEqual([
      otherProvider,
    ]);
  });
});

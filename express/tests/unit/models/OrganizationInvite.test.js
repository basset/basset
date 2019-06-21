const OrganizationInvite = require('../../../app/models/OrganizationInvite');

const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createUser } = require('../../utils/user');
const { createInvite } = require('../../utils/invite');

describe('OrganizationInvite', () => {
  let user, user2, otherUser;
  let member, member2, otherMember;
  let organization, otherOrganization;
  let invite, invite2, otherInvite;

  beforeAll(async () => {
    user = await createUser('inviter@invitemodel.io');
    organization = await createOrganization('organization');
    member = await addUserToOrganization(organization.id, user.id, true);
    user = await user.$query().eager('organizations');

    user2 = await createUser('inviter2@invitemodel.io');
    member2 = await addUserToOrganization(organization.id, user2.id, false);
    user2 = await user2.$query().eager('organizations');

    otherUser = await createUser('inviter@invitemodel2.io');
    otherOrganization = await createOrganization('organization2');
    otherMember = await addUserToOrganization(
      otherOrganization.id,
      otherUser.id,
      true,
    );
    otherUser = await otherUser.$query().eager('organizations');

    invite = await createInvite(
      'invited@invitemodel.io',
      member,
      organization.id,
    );
    invite2 = await createInvite(
      'invited2@invitemodel.io',
      member2,
      organization.id,
    );
    otherInvite = await createInvite(
      'invited2@invitemodel.io',
      otherMember,
      otherOrganization.id,
    );
  });

  test('canRead', async () => {
    expect(await invite.canRead(user)).toBe(true);
    expect(await invite.canRead(otherUser)).toBe(false);
    expect(await invite2.canRead(user)).toBe(true);
    expect(await invite2.canRead(otherUser)).toBe(false);
    expect(await otherInvite.canRead(otherUser)).toBe(true);
    expect(await otherInvite.canRead(user)).toBe(false);
  });

  test.each([['canDelete'], ['canEdit'], ['canCreate']])('%s', async fn => {
    expect(await invite[fn](user)).toBe(true);
    expect(await invite[fn](user2)).toBe(false);
  });

  test('authorizationFilter', async () => {
    const invites = await OrganizationInvite.authorizationFilter(user);
    expect(invites).toEqual(expect.arrayContaining([invite, invite2]));
    expect(await OrganizationInvite.authorizationFilter(user2)).toEqual(
      invites,
    );
  });
});

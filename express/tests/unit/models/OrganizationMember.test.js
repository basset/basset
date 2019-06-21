const OrganizationMember = require('../../../app/models/OrganizationMember');

const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createUser } = require('../../utils/user');

describe('OrganizationMember', () => {
  let user, user2, otherUser;
  let member, member2, otherMember;
  let organization, otherOrganization;

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
  });

  test('canRead', async () => {
    expect(await member.canRead(user)).toBe(true);
    expect(await member.canRead(otherUser)).toBe(false);
    expect(await member2.canRead(user)).toBe(true);
    expect(await member2.canRead(otherUser)).toBe(false);
    expect(await otherMember.canRead(otherUser)).toBe(true);
    expect(await otherMember.canRead(user)).toBe(false);
  });

  test.each([['canDelete'], ['canEdit']])('%s', async fn => {
    expect(await member[fn](user)).toBe(true);
    expect(await member2[fn](user)).toBe(true);
    expect(await member[fn](user2)).toBe(false);
  });

  test('authorizationFilter', async () => {
    const members = await OrganizationMember.authorizationFilter(user);
    expect(members).toEqual(expect.arrayContaining([member, member2]));
    expect(await OrganizationMember.authorizationFilter(user2)).toEqual(
      members,
    );
  });
});

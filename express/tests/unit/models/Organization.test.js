const Organization = require('../../../app/models/Organization');

const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createUser } = require('../../utils/user');
const settings = require('../../../app/settings');

describe('Organization', () => {
  let user, otherUser;
  let organization, otherOrganization;

  beforeAll(async () => {
    user = await createUser('snapshot@organizationmodel.io');
    organization = await createOrganization('organization');
    await addUserToOrganization(organization.id, user.id);
    user = await user.$query().eager('organizations');

    otherUser = await createUser('snapshot@organizationmodel2.io');
    otherOrganization = await createOrganization('organization2');
    addUserToOrganization(otherOrganization.id, otherUser.id, true);
    otherUser = await otherUser.$query().eager('organizations');
  });

  test('canRead', async () => {
    expect(await organization.canRead(user)).toBe(true);
    expect(await organization.canRead(otherUser)).toBe(false);
    expect(await otherOrganization.canRead(otherUser)).toBe(true);
    expect(await otherOrganization.canRead(user)).toBe(false);
  });

  test('canCreate', async () => {
    settings.site.private = true;
    expect(await organization.canCreate(user)).toBe(false);
    user.admin = true;
    expect(await organization.canCreate(user)).toBe(true);
    settings.site.private = false;
    expect(await organization.canCreate(user)).toBe(true);
    user.admin = false;
    expect(await organization.canCreate(user)).toBe(true);
  });

  test.each([['canDelete'], ['canEdit']])('%s', async fn => {
    user.admin = false;
    settings.site.private = true;
    expect(await organization[fn](user)).toBe(false);
    user.admin = true;
    expect(await organization[fn](user)).toBe(true);
    settings.site.private = false;
    await user
      .$relatedQuery('organizationMemberships')
      .first()
      .update({
        admin: false,
      });
    expect(await organization[fn](user)).toBe(false);
    await user
      .$relatedQuery('organizationMemberships')
      .first()
      .update({
        admin: true,
      });
    expect(await organization[fn](user)).toBe(true);
  });

  test('authorizationFilter', async () => {
    const createdOrgs = [
      await createOrganization('test2'),
      await createOrganization('test3'),
      await createOrganization('test4'),
    ];
    for await (const org of createdOrgs) {
      await addUserToOrganization(org.id, user.id);
    }
    createdOrgs.unshift(organization);
    user = await user.$query().eager('organizations');
    const orgs = await Organization.authorizationFilter(user);
    expect(orgs).toEqual(createdOrgs);
  });
});

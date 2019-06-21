const {
  createUser,
  activateUserFromToken,
} = require('../../../app/utils/registration');
const { generateToken } = require('../../../app/utils/auth/token');
const { encode } = require('../../../app/utils/safe-base64');
const emails = require('../../../app/utils/email');
const OrganizationMember = require('../../../app/models/OrganizationMember');

const { createOrganization } = require('../../utils/organization');
const userUtil = require('../../utils/user');

jest.mock('../../../app/utils/email', () => ({
  sendActivationEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}));

const { configure } = require('../../../app/db');
let knex;
beforeAll(() => {
  knex = configure();
});
afterAll(() => {
  knex.destroy();
});

describe('regististration', () => {
  describe('activateUserFromToken', async () => {
    it('should activate a user', async () => {
      const user = await userUtil.createUser('token@basset.io');
      const token = await generateToken(user);
      const uidb64 = encode(user.id);
      expect(user.active).toBe(false);
      const req = {
        headers: {},
        connection: {},
        socket: {},
        login: jest.fn(),
      };
      const returnUser = await activateUserFromToken(null, req, uidb64, token);
      expect(returnUser).toBeDefined();
      expect(returnUser.active).toBe(true);
      expect(returnUser.id).toBe(user.id);
      expect(emails.sendWelcomeEmail).toHaveBeenCalled();
    });
    it('should throw an error on invalid uidb64', async () => {
      try {
        await activateUserFromToken(null, encode('10'), '');
      } catch (error) {
        expect(error.message).toBe('Invalid token.');
      }
    });
    it('should throw an error on invalid token', async () => {
      const user = await userUtil.createUser('token1@basset.io');
      const uidb64 = encode(user.id.toString());
      try {
        await activateUserFromToken(null, uidb64, '');
      } catch (error) {
        expect(error.message).toBe('Invalid token.');
      }
    });
  });
  describe('createUser', () => {
    it('should create a new user', async () => {
      const email = 'test@basset.io';
      const password = 'test';
      const name = 'test';
      const user = await createUser(
        null,
        { email, password, name },
        { sendEmail: false },
      );
      expect(user.id).toBeDefined();
      expect(user).toEqual(
        expect.objectContaining({
          email,
          name,
        }),
      );
    });
    it('should add a user to an organization', async () => {
      const organization = await createOrganization('test');
      const email = 'test2@basset.io';
      const password = 'test';
      const name = 'test';
      const user = await createUser(
        null,
        { email, password, name },
        { sendEmail: false, organizationId: organization.id },
      );
      const organizationMember = await OrganizationMember.query()
        .where('organizationId', organization.id)
        .first();
      expect(organizationMember.userId).toBe(user.id);
    });
    it('should send an email after creating a user', async () => {
      const email = 'test3@basset.io';
      const password = 'test';
      const name = 'test';
      await createUser(null, { email, password, name });
      expect(emails.sendActivationEmail).toHaveBeenCalled();
    });
  });
});

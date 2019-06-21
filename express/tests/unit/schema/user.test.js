const runQuery = require('./run-query');

const User = require('../../../app/models/User');

const { createUser } = require('../../utils/user');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { generateToken } = require('../../../app/utils/auth/token');
const { encode } = require('../../../app/utils/safe-base64');

const { passport } = require('../../../app/utils/auth/strategy');

const emails = require('../../../app/utils/email');

jest.mock('../../../app/utils/email', () => ({
  sendActivationEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}));

/*
jest.mock('../../../app/utils/auth/access', () => ({
  loginSuccessful: jest.fn(),
  getClientInfo: jest.fn(),
}));

const { loginSuccessful } = require('../../../app/utils/auth/access');
const { sendActivationEmail, sendWelcomeEmail } = require('../../../app/utils/email');
*/

describe('user schema', () => {
  let user, organization;
  describe('query', () => {
    beforeAll(async () => {
      const email = 'trolololol@basset.io';
      const name = 'test';
      user = await createUser(email, { name });
      organization = await createOrganization('test');
      await addUserToOrganization(organization.id, user.id);
    });
    afterAll(async () => {
      await user.$query().delete();
      await organization.$query().delete();
    });
    const query = `
    query($first: Int!, $organizationId: ID!) {
      users(first: $first, organizationId: $organizationId) {
        edges {
          node {
          id
          name
          email
          }
        }
      }
    }
    `;
    test('get users', async () => {
      const variables = {
        first: 100,
        organizationId: organization.id,
      };
      const result = await runQuery(query, user, variables);
      expect(result.errors).toBeUndefined();
      expect(result.data.users.edges.length).toBe(1);
      expect(result.data.users.edges[0].node.id).toBe(user.id);
    });

    test('cannot get users of another organization', async () => {
      const otherUser = await createUser('test@notbasset.io');
      const otherOrganization = await createOrganization('notbasset.io');
      await addUserToOrganization(otherOrganization.id, otherUser.id);

      const variables = {
        first: 100,
        organizationId: otherOrganization.id,
      };

      const result = await runQuery(query, user, variables);
      expect(result.errors).toBeUndefined();
      expect(result.data.users.edges.length).toBe(0);
    });
  });

  describe('mutation', () => {
    describe('changePassword', () => {
      let user, query;
      beforeAll(async () => {
        query = `
        mutation changePassword($password: String!) {
          changePassword(password: $password)
        }
        `;
        user = await createUser('password@basset.io');
      });
      afterAll(async () => {
        await user.$query().delete();
      });
      test('users can change their password', async () => {
        const variables = {
          password: 'yoyoyo',
        };
        const result = await runQuery(query, user, variables);
        expect(result.data.changePassword).toEqual(true);
        updated = await user.$query();
        expect(updated.password).not.toBe(user.password);
      });
    });

    describe('editUser', () => {
      let user, query;
      beforeAll(async () => {
        query = `
        mutation editUser($name: String!) {
          editUser(name: $name) {
            id
            name
          }
        }
        `;
        user = await createUser('edit@basset.io');
      });
      afterAll(async () => {
        await user.$query().delete();
      });
      test('users can edit their account', async () => {
        const variables = {
          name: 'tester',
        };
        const result = await runQuery(query, user, variables);

        expect(result.data.editUser.id).toEqual(user.id);
        expect(result.data.editUser.name).toEqual('tester');
      });
    });
    describe('deleteUser', () => {
      let user, admin, nonAdmin, query;
      beforeAll(async () => {
        user = await createUser('deleteuser@basset.io');
        admin = await createUser('deleteadmin@basset.io', { admin: true });
        nonAdmin = await createUser('nonadmin@basset.io');
        query = `
          mutation deleteUser($id: ID!) {
            deleteUser(id: $id)
          }
        `;
      });
      afterAll(async () => {
        await user.$query().delete();
        await admin.$query().delete();
        await nonAdmin.$query().delete();
      });
      test('admins can delete a user', async () => {
        const variables = {
          id: user.id,
        };
        const result = await runQuery(query, admin, variables);
        expect(result.data.deleteUser).toBe(true);
        user = await user.$query();
        expect(user).toBeUndefined();
      });

      test('non admins cannot delete a user', async () => {
        const variables = {
          id: nonAdmin.id,
        };
        const result = await runQuery(query, nonAdmin, variables);
        expect(result.errors[0].message).toBe('Only admins can delete users.');
        nonAdmin = await nonAdmin.$query();
        expect(nonAdmin).toBeDefined();
      });
    });
    describe('login', () => {
      let password, email, user, query, context;
      beforeAll(async () => {
        passport.initialize();
        password = 'basset';
        email = 'login@basset.io';
        user = await createUser(email, { password, active: true });
        query = `
        mutation login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            id
          }
        }
        `;
        context = {
          req: {
            headers: {
              'x-forwarded-for': '127.0.0.1',
            },
            login: jest.fn((user, cb) => {
              cb();
            }),
          },
        };
      });
      afterAll(async () => {
        await User.query()
          .where('email', email)
          .delete();
      });

      test('can login', async () => {
        const variables = {
          email,
          password,
        };
        const result = await runQuery(query, null, variables, context);

        expect(result.data.login.id).toBe(user.id);
      });

      test('cannot login with wrong creds', async () => {
        const variables = {
          email,
          password: 'wrong',
        };
        expect(user.active).toBe(true);
        const result = await runQuery(query, null, variables, context);
        expect(result.errors[0].message).toBe('Invalid credentials.');
      });

      test('locked out after 4 attemps', async () => {
        let result;
        for (attempt of Array.from(Array(5))) {
          const variables = {
            email,
            password: 'wrong',
          };
          expect(user.active).toBe(true);
          result = await runQuery(query, null, variables, context);
        }
        expect(result.errors[0].message).toBe(
          'Account is locked for 5 minutes.',
        );
      });
    });

    describe('signUp', () => {
      let query, email, password, name;
      beforeAll(async () => {
        email = 'signup@basset.io';
        password = 'basset';
        name = 'basset';
        query = `
          mutation signUp($email: String!, $password: String!, $name: String!) {
            signUp(email: $email, password: $password, name: $name) {
              id
              name
              active
            }
          }
        `;
      });
      afterAll(async () => {
        await user.$query().delete();
      });
      test('can signup', async () => {
        const variables = {
          email,
          password,
          name,
        };
        const result = await runQuery(query, null, variables);
        expect(result.data.signUp.id).toBeDefined();
        expect(result.data.signUp.name).toBe(name);
        expect(emails.sendActivationEmail).toHaveBeenCalled();
        emails.sendActivationEmail.mockReset();
      });

      test('cannot signup existing email', async () => {
        const variables = {
          email,
          password,
          name,
        };
        const result = await runQuery(query, null, variables);
        expect(result.errors[0].message).toBe(
          'Cannot register with this email address.',
        );
        expect(emails.sendActivationEmail).not.toHaveBeenCalled();
      });
    });

    describe('activate', () => {
      let query, user, organization, id, token;
      beforeAll(async () => {
        query = `
          mutation activate($id: String!, $token: String!) {
            activate(id: $id, token: $token) {
              id
              email
              active
              updatedAt
            }
          }
        `;
        organization = await createOrganization('basset');
        user = await createUser('activate@basset.io', {
          active: false,
          password: 'basset',
          name: 'basset',
        });
        token = generateToken(user);
        id = encode(user.id.toString());
      });
      afterAll(async () => {
        await user.$query().delete();
        await organization.$query().delete();
      });
      test('can activate', async () => {
        const variables = {
          id,
          token,
        };
        const context = {
          req: {
            headers: {
              'x-forwarded-for': '127.0.0.1',
            },
            login: jest.fn((user, cb) => {
              cb();
            }),
          },
        };

        const result = await runQuery(query, null, variables, context);
        expect(result.data.activate.id).toBeDefined();
        expect(result.data.activate.active).toBe(true);
        expect(result.data.activate.email).toBe('activate@basset.io');
        expect(parseInt(result.data.activate.updatedAt)).not.toBe(
          user.updatedAt.getTime(),
        );
      });

      test('cannot activate invalid token', async () => {
        const variables = {
          id,
          token: 'whooops',
        };
        const result = await runQuery(query, null, variables);
        expect(result.errors[0].message).toBe('Invalid token.');
      });

      test('cannot activate invalid uid', async () => {
        const variables = {
          id: 'MRRRRR',
          token,
        };
        const result = await runQuery(query, null, variables);
        expect(result.errors[0].message).toBe('Invalid token.');
      });

      test('cannot activate already activated user', async () => {
        const variables = {
          id,
          token,
        };
        const context = {
          req: {
            headers: {
              'x-forwarded-for': '127.0.0.1',
            },
            login: jest.fn((user, cb) => {
              cb();
            }),
          },
        };

        const result = await runQuery(query, null, variables, context);
        expect(result.errors[0].message).toBe('Invalid token.');
      });
    });
  });
});

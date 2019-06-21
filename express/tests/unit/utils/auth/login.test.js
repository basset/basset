jest.mock('../../../../app/utils/auth/access', () => ({
  loginFailed: jest.fn(),
  loginSuccessful: jest.fn(),
  getClientInfo: jest.fn(),
  resetExpiredAttempts: jest.fn(),
}));

const access = require('../../../../app/utils/auth/access');
const {
  loginUserWithPassword,
  loginUserWithProvider,
} = require('../../../../app/utils/auth/login');

const { createUser } = require('../../../utils/user');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../../utils/organization');
const { createInvite } = require('../../../utils/invite');

describe('loginUserWithPassword', () => {
  it('should login a user with their password', async () => {
    const email = 'test@basset.io';
    const password = 'tester';
    const user = await createUser(email, { password, active: true });
    const result = await loginUserWithPassword({ email, password });
    expect(user.id).toBe(result.user.id);
    expect(result.error).toBeUndefined();
    expect(user.lastLogin).not.toBe(result.user.lastLogin);
    expect(access.resetExpiredAttempts).toHaveBeenCalled();
  });

  it('should not allow a user to login with invalid password', async () => {
    const { error } = await loginUserWithPassword({
      email: 'test@basset.io',
      password: 'wrong password',
    });
    expect(error).toBe('Invalid credentials.');
    expect(access.resetExpiredAttempts).toHaveBeenCalled();
  });
  it('should return an error when user doesnt exist', async () => {
    const { error } = await loginUserWithPassword({
      email: 'tester@basset.io',
      password: 'wrong password',
    });
    expect(error).toBe('Invalid credentials.');
  });
  it('should return an error if the user is inactive', async () => {
    const email = 'tester@basset.io';
    const password = 'tester';
    await createUser(email, { password });
    const { error } = await loginUserWithPassword({ email, password });
    expect(error).toBe('Account is inactive.');
  });
  it('should return an error if the user is lockedout', async () => {
    const email = 'test2@basset.io';
    const password = 'tester';
    await createUser(email, { password, locked: true, active: true });
    const { error } = await loginUserWithPassword({ email, password });

    expect(error).toBe('Account is locked for 5 minutes.');
  });
});

describe('loginUserWithProvider', () => {
  let user;
  beforeAll(async () => {
    user = await createUser('user@basset.io', { active: true });
  });
  it('should allow logged in users to add a provider account', async () => {
    const req = {
      user,
    };
    const providerInfo = {
      providerId: 1,
      provider: 'github',
      token: 'accessToken',
    };

    const userInfo = {
      name: 'tester tester',
      email: 'weird@basset.io',
      profileImage: 'image',
    };
    const result = await loginUserWithProvider({ req, userInfo, providerInfo });
    expect(result.error).toBeUndefined();
    updatedUser = await user.$query().eager('providers');
    expect(updatedUser.profileImage).toBe('image');
    expect(updatedUser.providers).toHaveLength(1);
    expect(updatedUser.providers[0].token).toBe('accessToken');
    expect(updatedUser.providers[0].providerId).toBe('1');
    expect(updatedUser.providers[0].provider).toBe('github');
  });
  it('should link an existing account based on providerId', async () => {
    const req = {};
    const providerInfo = {
      providerId: 1,
      provider: 'github',
      token: 'accessToken',
    };

    const userInfo = {
      name: 'tester tester',
      email: 'sameuser@basset.io',
      profileImage: 'image',
    };
    const result = await loginUserWithProvider({
      req,
      userInfo,
      providerInfo,
    });
    expect(result.user.email).toBe('user@basset.io');
    expect(result.error).toBeUndefined();
  });
  it('should link an existing account based on email address', async () => {
    await createUser('anotheruser@basset.io', { active: true });
    const req = {};
    const providerInfo = {
      providerId: 5,
      provider: 'github',
      token: 'accessToken',
    };

    const userInfo = {
      name: 'tester tester',
      email: 'anotheruser@basset.io',
      profileImage: 'image',
    };
    const result = await loginUserWithProvider({
      req,
      userInfo,
      providerInfo,
    });
    expect(result.error).toBeUndefined();
    expect(result.user.email).toBe('anotheruser@basset.io');
  });
  it('should not allow an account which is inactive to link', async () => {
    await createUser('inactiveuser@basset.io');
    const req = {};
    const providerInfo = {
      providerId: 6,
      provider: 'github',
      token: 'accessToken',
    };

    const userInfo = {
      name: 'tester tester',
      email: 'inactiveuser@basset.io',
      profileImage: 'image',
    };
    const result = await loginUserWithProvider({ req, userInfo, providerInfo });
    expect(result.user).toBeUndefined();
    expect(result.error).toBe('Account is inactive.');
  });
  it('should create a new account if none exists', async () => {
    const req = {};
    const providerInfo = {
      providerId: 10,
      provider: 'github',
      token: 'accessToken',
    };

    const userInfo = {
      name: 'tester tester',
      email: 'newuser@basset.io',
      profileImage: 'image',
    };
    const result = await loginUserWithProvider({
      req,
      userInfo,
      providerInfo,
    });
    expect(result.user.name).toBe('tester tester');
    expect(result.user.email).toBe('newuser@basset.io');
    expect(result.user.active).toBe(true);
  });
  it('settings can disable allowing creating accounts', async () => {
    const settings = require('../../../../app/settings');
    settings.site.private = true;
    const req = {};
    const providerInfo = {
      providerId: 15,
      provider: 'github',
      token: 'accessToken',
    };

    const userInfo = {
      name: 'tester tester',
      email: 'privatesite@basset.io',
      profileImage: 'image',
    };
    const result = await loginUserWithProvider({ req, userInfo, providerInfo });
    expect(result.error).toBe('User not found.');
    expect(result.user).toBeUndefined();
  });
  it('should link invites to new accounts', async () => {
    const org = createOrganization('basset');
    const member = await addUserToOrganization(org.id, user.id);
    const invite = await createInvite('inviteduser@basset.io', member, org.id);
    const req = {};
    const providerInfo = {
      providerId: 20,
      provider: 'github',
      token: 'accessToken',
    };

    const userInfo = {
      name: 'tester tester',
      email: 'inviteduser@basset.io',
      profileImage: 'image',
    };
    const result = await loginUserWithProvider({
      req,
      userInfo,
      providerInfo,
    });
    expect(result.user.email).toBe(invite.email);
    expect(result.user.active).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('attemptLogin', () => {
  it('allows local login with username and password', async () => {
    const mockUser = await createUser('login@basset.io');
    jest.resetModules();
    jest.mock('passport', () => ({
      authenticate: jest.fn((type, cb) => {
        return () => cb(null, mockUser);
      }),
    }));
    let access = require('../../../../app/utils/auth/access'); // need to require mock again
    let { attemptLogin } = require('../../../../app/utils/auth/login');
    const req = {
      login: jest.fn((u, cb) => {
        return cb(null);
      }),
    };
    const res = {};
    const user = await attemptLogin({ req, res }, 'login@basset.io', 'basset');
    expect(user.email).toBe(mockUser.email);
    expect(req.login).toHaveBeenCalled();
    expect(access.loginSuccessful).toHaveBeenCalled();
  });
  it('throws an error if theres an issue with passport authenticate', async () => {
    jest.resetModules();
    jest.mock('passport', () => ({
      authenticate: jest.fn((type, cb) => {
        return () => cb(null, false, 'uh oh');
      }),
    }));
    let access = require('../../../../app/utils/auth/access'); // need to require mock again
    let { attemptLogin } = require('../../../../app/utils/auth/login');
    const req = {
      login: jest.fn((u, cb) => {
        return cb(null);
      }),
    };
    const res = {};
    try {
      await attemptLogin({ req, res }, 'login@basset.io', 'basset');
    } catch (error) {
      expect(error).toBe('uh oh');
      expect(req.login).not.toHaveBeenCalled();
      expect(access.loginFailed).toHaveBeenCalled();
    }
  });
  it('throws an error if theres an issue with login', async () => {
    jest.resetModules();
    jest.mock('passport', () => ({
      authenticate: jest.fn((type, cb) => {
        return () => cb(null, {});
      }),
    }));
    let access = require('../../../../app/utils/auth/access'); // need to require mock again
    let { attemptLogin } = require('../../../../app/utils/auth/login');
    const req = {
      login: jest.fn((u, cb) => {
        return cb(new Error('trouble'));
      }),
    };
    const res = {};
    try {
      await attemptLogin({ req, res }, 'login@basset.io', 'basset');
    } catch (error) {
      expect(error.message).toBe('trouble');
      expect(access.loginFailed).toHaveBeenCalled();
    }
  });
});

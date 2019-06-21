const { createUser } = require('../../../utils/user');

const strategy = require('../../../../app/utils/auth/strategy');
jest.mock('../../../../app/utils/auth/login', () => ({
  loginUserWithProvider: jest.fn(),
  loginUserWithPassword: jest.fn(),
}));
const login = require('../../../../app/utils/auth/login');

test('deserialize', async () => {
  const user = await createUser('tester@basset.io');
  const cb = jest.fn();
  await strategy.passport._deserializers[0](user.id, cb);
  expect(cb).toHaveBeenCalledWith(null, expect.objectContaining(user));
});

test('local strategy', async () => {
  const cb = jest.fn();
  const email = 'tester@basset.io';
  const password = 'password';
  await strategy.localLoginStrategy(email, password, cb);
  expect(login.loginUserWithPassword).toHaveBeenCalledWith({ email, password });
  expect(cb).toHaveBeenCalled();
});

describe('github strategy', () => {
  it('should be disbabled if settings has it disabled', () => {
    jest.mock('../../../../app/settings', () => {
      const settings = require.requireActual('../../../../app/settings');
      settings.oauth.strategy.github.use = false;
      return settings;
    });

    jest.resetModules();
    let { passport } = require('../../../../app/utils/auth/strategy');
    expect(passport._strategies['github']).toBeUndefined();
  });
  it('should pass user info to the login method', async () => {
    const profile = {
      id: 1,
      photos: [
        {
          value: 'image',
        },
      ],
      emails: [
        {
          primary: true,
          value: 'tester@basset.io',
        },
      ],
      displayName: 'tester tester',
    };
    const providerInfo = {
      providerId: 1,
      provider: 'github',
      token: 'accessToken',
    };

    const userInfo = {
      name: 'tester tester',
      email: 'tester@basset.io',
      profileImage: 'image',
    };
    const req = {};
    const cb = jest.fn();
    await strategy.githubLoginStrategy(
      req,
      'accessToken',
      'refreshToken',
      profile,
      cb,
    );
    expect(login.loginUserWithProvider).toHaveBeenCalledWith({
      req,
      userInfo,
      providerInfo,
    });
    expect(cb).toHaveBeenCalled();
  });
});

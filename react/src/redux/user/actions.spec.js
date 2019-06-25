jest.mock('../router/actions.js', () => ({
  goLogin: jest.fn(),
  goHome: jest.fn(),
  navigateTo: jest.fn(),
}));
import * as actions from './actions.js';

import * as routerActions from '../router/actions.js';
import * as organizationActions from '../organizations/actions.js';
import * as projectActions from '../projects/actions.js';
import ApolloClient from '../../graphql/client.js';

let store;
let userData;
beforeEach(() => {
  jest.resetModules();
  store = require('../store.js').default;
  userData = {
    name: 'billy',
    email: 'billby@basset.io',
    providers: {
      edges: [],
    },
    organizations: {
      edges: [],
    },
  };
});

test('setError', () => {
  store.dispatch(actions.setError('oops'));
  const { user } = store.getState();
  expect(user.error).toBe('oops');
});

test('isLoading', () => {
  store.dispatch(actions.setError('oops'));
  store.dispatch(actions.isLoading());
  const { user } = store.getState();
  expect(user.isLoading).toBe(true);
  expect(user.error).toBe('');
});

test('doneLoading', () => {
  store.dispatch(actions.doneLoading());
  const { user } = store.getState();
  expect(user.isLoading).toBe(false);
});

test('isUpdating', () => {
  store.dispatch(actions.isUpdating());
  const { user } = store.getState();
  expect(user.isUpdating).toBe(true);
});

test('doneUpdating', () => {
  store.dispatch(actions.doneUpdating());
  const { user } = store.getState();
  expect(user.isUpdating).toBe(false);
});

test('receiveUser', () => {
  const user = {
    name: 'billy',
    email: 'billby@basset.io',
  };
  store.dispatch(actions.receiveUser(userData));
  const state = store.getState().user;
  expect(state.user).toEqual(expect.objectContaining(user));
  expect(state.isAuthenticated).toBe(true);
});

test('loginUser', () => {
  organizationActions.receiveOrganizations = jest.fn(() => () => {});
  projectActions.getProjects = jest.fn(() => () => {});
  store.dispatch(actions.loginUser(userData));
  expect(organizationActions.receiveOrganizations).toHaveBeenCalled();
  expect(projectActions.getProjects).toHaveBeenCalled();
  const state = store.getState().user;
  expect(state.isAuthenticated).toBe(true);
});

test('login', () => {
  organizationActions.receiveOrganizations = jest.fn(() => () => {});

  store.dispatch(actions.login(userData, '/gohere'));
  expect(organizationActions.receiveOrganizations).toHaveBeenCalled();
  expect(routerActions.navigateTo).toHaveBeenCalledWith('/gohere');
  const state = store.getState().user;
  expect(state.isAuthenticated).toBe(true);
});

test('logoutUser', () => {
  store.dispatch(actions.receiveUser(userData));
  store.dispatch(actions.logoutUser());
  const state = store.getState().user;
  expect(state.isAuthenticated).toBe(false);
  expect(state.user.name).toBe('');
  expect(state.user.email).toBe('');
});

test('logout', async () => {
  ApolloClient.mutate = jest.fn(() => Promise.resolve({}));
  await store.dispatch(actions.logout());

  const state = store.getState().user;
  expect(state.isAuthenticated).toBe(false);
  expect(state.user.name).toBe('');
  expect(state.user.email).toBe('');
  expect(routerActions.goLogin).toHaveBeenCalledTimes(1);
  expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
});

test('updateUser', () => {
  userData.name = 'not billy';
  store.dispatch(actions.updateUser(userData));
  const state = store.getState().user;
  expect(state.user.name).toBe('not billy');
});

test('saveUser', async () => {
  let resolver;
  userData.name = 'not billy';
  ApolloClient.mutate = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () =>
    resolver({
      data: {
        editUser: {
          ...userData,
        },
      },
    });

  const saveUser = store.dispatch(
    actions.saveUser({ user: { name: 'oh boy' } }),
  );
  let state = store.getState().user;
  expect(state.isUpdating).toBe(true);
  await resolvePromise();
  await saveUser;
  state = store.getState().user;
  expect(state.isUpdating).toBe(false);
  expect(state.user.name).toBe('not billy');
  expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
});

jest.mock('../projects/actions.js', () => ({
  getProjects: jest.fn(() => () => {}),
}));
jest.mock('../router/actions.js', () => ({
  goHome: jest.fn(() => () => {}),
}));
jest.mock('../../graphql/client.js', () => ({
  mutate: jest.fn(),
  query: jest.fn(),
  resetStore: jest.fn(),
}));

import * as projectActions from '../projects/actions.js';
import * as routerActions from '../router/actions.js';

import * as actions from './actions.js';
import ApolloClient from '../../graphql/client.js';

let store;
let organizationData;
let organizationsData;
beforeEach(() => {
  jest.resetModules();
  store = require('../store.js').default;
});

test('setError', () => {
  store.dispatch(actions.setError('oops'));
  const { organizations } = store.getState();
  expect(organizations.error).toBe('oops');
});

test('isLoading', () => {
  store.dispatch(actions.isLoading());
  const { organizations } = store.getState();
  expect(organizations.isLoading).toBe(true);
});

test('doneLoading', () => {
  store.dispatch(actions.doneLoading());
  const { organizations } = store.getState();
  expect(organizations.isLoading).toBe(false);
});

test('receiveOrgnaizations', () => {
  const organizations = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveOrganizations(organizations));
  let state = store.getState().organizations;
  expect(state.organizations).toEqual(organizations);
  expect(state.organizations).toHaveLength(3);

  store.dispatch(
    actions.receiveOrganizations([{ id: '4' }, { id: '5' }, { id: '6' }]),
  );
  state = store.getState().organizations;
  expect(state.organizations).toHaveLength(3);
  expect(state.organizations).not.toEqual(organizations);
});

test('addOrganization', () => {
  const organizations = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveOrganizations(organizations));
  store.dispatch(
    actions.addOrganization({
      id: '4',
    }),
  );
  const state = store.getState().organizations;
  expect(state.organizations).toHaveLength(4);
  expect(state.organizations[3].id).toBe('4');
});

test('setCurrentOrganization', () => {
  store.dispatch(actions.setCurrentOrganization('1'));
  expect(store.getState().organizations.currentOrganizationId).toBe('1');
});

test('updateOrganization', async () => {
  const organizations = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveOrganizations(organizations));
  store.dispatch(actions.updateOrganization({ id: '1', name: 'Basset test' }));
  const state = store.getState().organizations;
  expect(state.organizations[0].name).toBe('Basset test');
});

test('changeOrganization', async () => {
  await store.dispatch(actions.changeOrganization({ id: '1234' }));
  const state = store.getState().organizations;
  expect(state.currentOrganizationId).toBe('1234');
  expect(ApolloClient.resetStore).toHaveBeenCalledTimes(1);
  expect(projectActions.getProjects).toHaveBeenCalledTimes(1);
  expect(routerActions.goHome).toHaveBeenCalledTimes(1);
});

test('changeOrganization doesnt get new organization if its already the current organization', async () => {
  store.dispatch(actions.setCurrentOrganization('1'));
  await store.dispatch(actions.changeOrganization({ id: '1' }));
  const state = store.getState().organizations;
  expect(state.organizations).toHaveLength(0);
  expect(ApolloClient.resetStore).toHaveBeenCalledTimes(1);
  expect(projectActions.getProjects).toHaveBeenCalledTimes(0);
  expect(routerActions.goHome).toHaveBeenCalledTimes(0);
});

test('removeOrganization', () => {
  store.dispatch(actions.receiveOrganizations([{ id: '1' }, { id: '2' }]));
  store.dispatch(actions.removeOrganization({ id: '1' }));
  const state = store.getState().organizations;
  expect(state.organizations).toHaveLength(1);
  expect(state.organizations[0].id).toBe('2');
});
test('leaveCurrentOrganization', () => {
  store.dispatch(actions.receiveOrganizations([{ id: '1' }, { id: '2' }]));
  store.dispatch(actions.setCurrentOrganization('1'));
  store.dispatch(actions.leaveCurrentOrganization());
  const state = store.getState().organizations;
  expect(state.organizations).toHaveLength(1);
  expect(state.organizations[0].id).toBe('2');
});

test('saveOrganization', async () => {
  const orgData = {
    data: {
      editOrganization: {
        id: '1',
        name: 'Basset updated',
      },
    },
  };
  let resolver;
  ApolloClient.mutate = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () => resolver(orgData);
  store.dispatch(actions.receiveOrganizations([{ id: '1' }, { id: '2' }]));
  store.dispatch(actions.setCurrentOrganization('1'));
  const save = store.dispatch(actions.saveOrganization({ name: 'Basset' }));
  expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
  let state = store.getState().organizations;
  expect(state.isUpdating).toBe(true);
  await resolvePromise();
  await save;
  state = store.getState().organizations;
  expect(state.isUpdating).toBe(false);
  expect(state.error).toBe('');
  expect(state.organizations[0].name).toBe('Basset updated');
});

jest.mock('../builds/actions.js', () => ({
  getBuilds: jest.fn(() => () => {}),
  setCurrentBuild: jest.fn(() => () => {}),
  clearBuilds: jest.fn(() => () => {}),
}));
jest.mock('../../graphql/client.js', () => ({
  mutate: jest.fn(),
  query: jest.fn(),
  resetStore: jest.fn(),
}));
import * as actions from './actions.js';
import * as buildActions from '../builds/actions.js';
import * as organizationActions from '../organizations/actions.js';
import * as userActions from '../user/actions.js';
import ApolloClient from '../../graphql/client.js';

let store;
let projectData;
let projectsData;
beforeEach(() => {
  jest.resetModules();
  store = require('../store.js').default;
  store.dispatch(
    organizationActions.receiveOrganizations([
      {
        id: '1234',
        name: 'organization',
        admin: true,
      },
    ]),
  );
  projectData = {
    data: {
      project: {
        __typename: 'Project',
      },
    },
  };

  projectsData = {
    data: {
      projects: {
        pageInfo: {
          hasNextPage: true,
          __typename: 'PageInfo',
        },
        edges: [
          {
            cursor:
              'MTU1NTk4NjUwNjM4Nw==:ZjU2MTE5ODctYzA4Ny00ZWQ3LTg1MGUtOGVjYWYxMDg0MjFj',
            node: {
              id: '1',
              name: 'Basset',
            },
            __typename: 'ProjectEdge',
          },
          {
            cursor:
              'MTU1NzE5MzcwNzU4MA==:MWVmMDVlODAtNTUzMy00N2U1LWFhODgtOTRmNDUyZDkxZjA4',
            node: {
              id: '2',
              name: 'Basset test',
            },
            __typename: 'ProjectEdge',
          },
        ],
        __typename: 'ProjectConnection',
      },
    },
  };
});

test('setError', () => {
  store.dispatch(actions.setError('oops'));
  const { projects } = store.getState();
  expect(projects.error).toBe('oops');
});

test('isLoading', () => {
  store.dispatch(actions.isLoading());
  const { projects } = store.getState();
  expect(projects.isLoading).toBe(true);
});

test('doneLoading', () => {
  store.dispatch(actions.doneLoading());
  const { projects } = store.getState();
  expect(projects.isLoading).toBe(false);
});

test('isLoadingMore', () => {
  store.dispatch(actions.isLoadingMore());
  const { projects } = store.getState();
  expect(projects.isLoadingMore).toBe(true);
});

test('doneLoadingMore', () => {
  store.dispatch(actions.doneLoadingMore());
  const { projects } = store.getState();
  expect(projects.isLoadingMore).toBe(false);
});

test('receiveProjects', () => {
  const projects = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveProjects(projects));
  let state = store.getState().projects;
  expect(state.projects).toEqual(projects);
  expect(state.projects).toHaveLength(3);

  store.dispatch(
    actions.receiveProjects([{ id: '4' }, { id: '5' }, { id: '6' }]),
  );
  state = store.getState().projects;
  expect(state.projects).toHaveLength(3);
  expect(state.projects).not.toEqual(projects);
});

test('addProject', () => {
  const projects = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveProjects(projects));
  store.dispatch(
    actions.addProject({
      id: '4',
    }),
  );
  const state = store.getState().projects;
  expect(state.projects).toHaveLength(4);
  expect(state.projects[3].id).toBe('4');
});

test('addProjects', () => {
  const projects = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveProjects(projects));
  store.dispatch(actions.addProjects([{ id: '4' }, { id: '5' }]));
  const state = store.getState().projects;
  expect(state.projects).toHaveLength(5);
  expect(state.projects[3].id).toBe('4');
  expect(state.projects[4].id).toBe('5');
});

test('updatePageInfo', () => {
  store.dispatch(
    actions.updatePageInfo({
      pageInfo: {
        hasNextPage: true,
      },
      edges: [
        { cursor: '1' },
        { cursor: '2' },
        { cursor: '3' },
        { cursor: '4' },
      ],
    }),
  );
  let state = store.getState().projects;
  expect(state.pageInfo.hasNextPage).toBe(true);
  expect(state.currentCursor).toBe('4');
  store.dispatch(
    actions.updatePageInfo({
      pageInfo: {
        hasNextPage: false,
      },
      edges: [],
    }),
  );
  state = store.getState().projects;
  expect(state.pageInfo.hasNextPage).toBe(false);
  expect(state.currentCursor).toBeNull();
});

test('getProjects without organizationId', async () => {
  store.dispatch(organizationActions.receiveOrganizations([]));
  store.dispatch(actions.getProjects());
  let state = store.getState().projects;
  expect(state.projects).toHaveLength(0);
  expect(ApolloClient.query).not.toHaveBeenCalled();
});

test('setCurrentProject', () => {
  store.dispatch(actions.setCurrentProject('1'));
  expect(store.getState().projects.currentProjectId).toBe('1');
});

test('getProjects', async () => {
  let resolver;
  ApolloClient.query = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () => resolver(projectsData);
  store.dispatch(actions.getProjects());
  let state = store.getState().projects;
  expect(ApolloClient.query).toHaveBeenCalled();
  expect(state.isLoading).toBe(true);
  await resolvePromise();
  state = store.getState().projects;
  expect(state.isLoading).toBe(false);
  expect(state.error).toBe('');
  expect(state.projects).toHaveLength(2);
  state = store.getState().projects;
  expect(state.pageInfo.hasNextPage).toBe(true);
  expect(state.currentCursor).toEqual(
    'MTU1NzE5MzcwNzU4MA==:MWVmMDVlODAtNTUzMy00N2U1LWFhODgtOTRmNDUyZDkxZjA4',
  );
});

test('updateProject', async () => {
  const projects = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveProjects(projects));
  store.dispatch(actions.updateProject({ id: '1', name: 'Basset test' }));
  const state = store.getState().projects;
  expect(state.projects[0].name).toBe('Basset test');
});

test('changeProject', async () => {
  const projects = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveProjects(projects));
  await store.dispatch(actions.changeProject({ id: '2' }));
  const state = store.getState().projects;
  expect(state.currentProjectId).toBe('2');
  expect(buildActions.getBuilds).toHaveBeenCalledTimes(1);
});

test('loadMore', async () => {
  let resolver;
  ApolloClient.query = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () => resolver(projectsData);
  const loadMore = store.dispatch(actions.loadMore());
  let state = store.getState().projects;
  expect(ApolloClient.query).toHaveBeenCalled();
  expect(state.isLoadingMore).toBe(true);
  await resolvePromise();
  await loadMore;
  state = store.getState().projects;
  expect(state.isLoadingMore).toBe(false);
  expect(state.error).toBe('');
  expect(state.projects).toHaveLength(2);
  expect(state.pageInfo.hasNextPage).toBe(true);
  expect(state.currentCursor).toEqual(
    'MTU1NzE5MzcwNzU4MA==:MWVmMDVlODAtNTUzMy00N2U1LWFhODgtOTRmNDUyZDkxZjA4',
  );
});

test('linkToProvider', async () => {
  ApolloClient.mutate = jest.fn(() => Promise.resolve());
  const location = window.location.href;
  store.dispatch(
    userActions.receiveUser({
      name: '',
      providers: {
        edges: [{ node: { providerId: 1234, provider: 'github' } }],
      },
    }),
  );
  await store.dispatch(actions.linkToProvider('github'));
  expect(ApolloClient.mutate).toHaveBeenCalled();
  expect(window.location.href).toBe(location);
});

test('linkToProvider redirects to oauth endpoint', async () => {
  ApolloClient.mutate = jest.fn(() => Promise.resolve());
  store.dispatch(
    userActions.receiveUser({
      name: '',
      providers: {
        edges: [],
      },
    }),
  );
  delete global.window.location;
  global.window.location = {
    href: '',
  };
  await store.dispatch(actions.linkToProvider('github'));
  expect(ApolloClient.mutate).not.toHaveBeenCalled();
  expect(window.location.href).toBe('/oauth/github');
});

test('linkProjectToProvider', async () => {
  const projectData = {
    data: {
      linkProviderToProject: {
        id: '1',
        repoActive: true,
      },
    },
  };
  let resolver;
  ApolloClient.mutate = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () => resolver(projectData);

  const projects = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveProjects(projects));

  const link = store.dispatch(actions.linkProjectToProvider('1', 'github'));
  let state = store.getState().projects;
  expect(state.isUpdating).toBe(true);
  await resolvePromise();
  await link;
  expect(ApolloClient.mutate).toHaveBeenCalled();
  state = store.getState().projects;
  expect(state.isUpdating).toBe(false);
  expect(state.error).toBe('');
  expect(state.projects[0].repoActive).toBe(true);
});

test('setLocationKey', async () => {
  store.dispatch(actions.setLocationKey('123abc'));
  const state = store.getState().projects;
  expect(state.locationKey).toBe('123abc');
});

test('checkLocationKey', async () => {
  store.dispatch(actions.setLocationKey('123abc'));
  store.dispatch(actions.checkLocationKey('123abc'));
  let state = store.getState().projects;
  expect(state.locationKey).toBe('123abc');
  expect(buildActions.setCurrentBuild).not.toHaveBeenCalled();

  store.dispatch(actions.checkLocationKey('newkey'));
  state = store.getState().projects;
  expect(state.locationKey).toBe('newkey');
  expect(buildActions.setCurrentBuild).toHaveBeenCalledTimes(1);
});

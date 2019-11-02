jest.mock('../snapshots/actions.js', () => ({
  getSnapshots: jest.fn(() => () => {}),
  setCurrentSnapshot: jest.fn(() => () => {}),
  clearSnapshots: jest.fn(() => () => {}),
  getSnapshotGroups: jest.fn(() => () => {}),
}));
jest.mock('../../graphql/client.js', () => ({
  mutate: jest.fn(),
  query: jest.fn(),
  resetStore: jest.fn(),
}));
import * as snapshotActions from '../snapshots/actions.js';
import * as actions from './actions.js';
import * as organizationActions from '../organizations/actions.js';
import * as projectActions from '../projects/actions.js';
import ApolloClient from '../../graphql/client.js';

let store;
let buildData;
let buildsData;
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
  store.dispatch(
    projectActions.receiveProjects([
      {
        id: '12345',
        name: 'Basset',
        defaultBranch: 'master',
        defaultWidth: '1280',
        hasToken: true,
        key: 'randomkey',
        scmProvider: null,
        scmActive: null,
        scmConfig: {
          repoName: null,
          repoOwner: null,
        },
        slackActive: null,
        slackVariable: null,
        slackWebhook: null,
      },
    ]),
  );
  store.dispatch(projectActions.setCurrentProject('12345'));
  buildData = {
    data: {
      build: {
        id: 'f0242992-31c7-4b10-ba22-14b29ed83ad8',
        projectId: '12345',
        number: 64,
        branch: 'more-tests-2',
        commitSha: 'eade84d0d1576792b9c700149be15dc259d7ae7e',
        commitMessage: 'add github integration tests\n',
        committerName: 'tester',
        comitterEmail: null,
        commitDate: '1557097066000',
        authorName: 'tester',
        authorEmail: 'tester@basset.io',
        createdAt: '1557102391963',
        updatedAt: '1557102409182',
        completedAt: '1557102409182',
        submittedAt: '1557102393737',
        cancelledAt: null,
        totalSnapshots: 33,
        approvedSnapshots: 0,
        modifiedSnapshots: 25,
        newSnapshots: 0,
        removedSnapshots: 0,
        __typename: 'Build',
      },
    },
  };

  buildsData = {
    data: {
      builds: {
        pageInfo: {
          hasNextPage: true,
          __typename: 'PageInfo',
        },
        edges: [
          {
            cursor:
              'MTU1NzYzNDkwNDMxMA==:ZTk5N2E4MDctODBjYy00MGEzLTgzMGEtZGEzMzkyMmE0YjRi',
            node: {
              id: 'e997a807-80cc-40a3-830a-da33922a4b4b',
              number: 68,
              branch: 'master',
              commitSha: '574ba74211e02e78dd6d23ce4ac148fca175bb95',
              commitMessage:
                'Merge pull request #30 from basset/inline-field-escape\n\nenable escape for inline field',
              committerName: 'GitHub',
              comitterEmail: null,
              commitDate: '1557634813000',
              authorName: 'tester',
              authorEmail: 'tester@basset.io',
              createdAt: '1557634904310',
              updatedAt: '1557634973022',
              completedAt: '1557634973022',
              submittedAt: '1557634906251',
              cancelledAt: null,
              totalSnapshots: 33,
              approvedSnapshots: 0,
              modifiedSnapshots: 0,
              newSnapshots: 33,
              removedSnapshots: 0,
              __typename: 'Build',
            },
            __typename: 'BuildEdge',
          },
          {
            cursor:
              'MTU1NzE1NzM5ODY0Nw==:NDViMTkzYjktMzNjNC00NzBhLThhZTQtNThmYjIyMzI0OGFj',
            node: {
              id: '45b193b9-33c4-470a-8ae4-58fb223248ac',
              number: 67,
              branch: 'more-tests-2',
              commitSha: '61657d2ec5f132afc574b717347a30c76dce1891',
              commitMessage: 'add render diff tests\n',
              committerName: 'tester',
              comitterEmail: null,
              commitDate: '1557120299000',
              authorName: 'tester',
              authorEmail: 'tester@basset.io',
              createdAt: '1557157398647',
              updatedAt: '1557157507189',
              completedAt: '1557157486765',
              submittedAt: '1557157400907',
              cancelledAt: null,
              totalSnapshots: 36,
              approvedSnapshots: 3,
              modifiedSnapshots: 3,
              newSnapshots: 0,
              removedSnapshots: 0,
              __typename: 'Build',
            },
            __typename: 'BuildEdge',
          },
          {
            cursor:
              'MTU1NzE1NzE4OTM4Mw==:Y2EwZWUyYjItMjQ3MS00MTY2LWIyM2EtMmQ0NzZkMDAzZjM0',
            node: {
              id: 'ca0ee2b2-2471-4166-b23a-2d476d003f34',
              number: 66,
              branch: 'more-tests-2',
              commitSha: '61657d2ec5f132afc574b717347a30c76dce1891',
              commitMessage: 'add render diff tests\n',
              committerName: 'tester',
              comitterEmail: null,
              commitDate: '1557120299000',
              authorName: 'tester',
              authorEmail: 'tester@basset.io',
              createdAt: '1557157189383',
              updatedAt: '1557157216337',
              completedAt: '1557157216337',
              submittedAt: '1557157191499',
              cancelledAt: null,
              totalSnapshots: 33,
              approvedSnapshots: 0,
              modifiedSnapshots: 12,
              newSnapshots: 0,
              removedSnapshots: 0,
              __typename: 'Build',
            },
            __typename: 'BuildEdge',
          },
          {
            cursor:
              'MTU1NzEwMzY3MzAwMQ==:ZmY4OTMxMWUtMzYwNC00OGY0LTk4NDEtZDJlZDYyMDFiMWIx',
            node: {
              id: 'ff89311e-3604-48f4-9841-d2ed6201b1b1',
              number: 65,
              branch: 'more-tests-2',
              commitSha: 'eade84d0d1576792b9c700149be15dc259d7ae7e',
              commitMessage: 'add github integration tests\n',
              committerName: 'tester',
              comitterEmail: null,
              commitDate: '1557097066000',
              authorName: 'tester',
              authorEmail: 'tester@basset.io',
              createdAt: '1557103673001',
              updatedAt: '1557103692571',
              completedAt: '1557103692571',
              submittedAt: '1557103674980',
              cancelledAt: null,
              totalSnapshots: 33,
              approvedSnapshots: 0,
              modifiedSnapshots: 8,
              newSnapshots: 0,
              removedSnapshots: 0,
              __typename: 'Build',
            },
            __typename: 'BuildEdge',
          },
          {
            cursor:
              'MTU1NzEwMjM5MTk2Mw==:ZjAyNDI5OTItMzFjNy00YjEwLWJhMjItMTRiMjllZDgzYWQ4',
            node: {
              id: 'f0242992-31c7-4b10-ba22-14b29ed83ad8',
              number: 64,
              branch: 'more-tests-2',
              commitSha: 'eade84d0d1576792b9c700149be15dc259d7ae7e',
              commitMessage: 'add github integration tests\n',
              committerName: 'tester',
              comitterEmail: null,
              commitDate: '1557097066000',
              authorName: 'tester',
              authorEmail: 'tester@basset.io',
              createdAt: '1557102391963',
              updatedAt: '1557102409182',
              completedAt: '1557102409182',
              submittedAt: '1557102393737',
              cancelledAt: null,
              totalSnapshots: 33,
              approvedSnapshots: 0,
              modifiedSnapshots: 0,
              newSnapshots: 0,
              removedSnapshots: 0,
              __typename: 'Build',
            },
            __typename: 'BuildEdge',
          },
        ],
        __typename: 'BuildConnection',
      },
    },
  };
});

test('setError', () => {
  store.dispatch(actions.setError('oops'));
  const { builds } = store.getState();
  expect(builds.error).toBe('oops');
});

test('isLoading', () => {
  store.dispatch(actions.isLoading());
  const { builds } = store.getState();
  expect(builds.isLoading).toBe(true);
});

test('doneLoading', () => {
  store.dispatch(actions.doneLoading());
  const { builds } = store.getState();
  expect(builds.isLoading).toBe(false);
});

test('isLoadingMore', () => {
  store.dispatch(actions.isLoadingMore());
  const { builds } = store.getState();
  expect(builds.isLoadingMore).toBe(true);
});

test('doneLoadingMore', () => {
  store.dispatch(actions.doneLoadingMore());
  const { builds } = store.getState();
  expect(builds.isLoadingMore).toBe(false);
});

test('receiveBuilds', () => {
  const builds = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveBuilds(builds));
  let state = store.getState().builds;
  expect(state.builds).toEqual(builds);
  expect(state.builds).toHaveLength(3);

  store.dispatch(
    actions.receiveBuilds([{ id: '4' }, { id: '5' }, { id: '6' }]),
  );
  state = store.getState().builds;
  expect(state.builds).toHaveLength(3);
  expect(state.builds).not.toEqual(builds);
});

test('addBuild', () => {
  const builds = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveBuilds(builds));
  store.dispatch(
    actions.addBuild({
      id: '4',
    }),
  );
  const state = store.getState().builds;
  expect(state.builds).toHaveLength(4);
  expect(state.builds[3].id).toBe('4');
});

test('addBuilds', () => {
  const builds = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveBuilds(builds));
  store.dispatch(actions.addBuilds([{ id: '4' }, { id: '5' }]));
  const state = store.getState().builds;
  expect(state.builds).toHaveLength(5);
  expect(state.builds[3].id).toBe('4');
  expect(state.builds[4].id).toBe('5');
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
  let state = store.getState().builds;
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
  state = store.getState().builds;
  expect(state.pageInfo.hasNextPage).toBe(false);
  expect(state.currentCursor).toBeNull();
});

test('getBuilds without organizationId', async () => {
  store.dispatch(organizationActions.receiveOrganizations([]));
  store.dispatch(actions.getBuilds());
  let state = store.getState().builds;
  expect(state.builds).toHaveLength(0);
  expect(ApolloClient.query).not.toHaveBeenCalled();
});

test('getBuilds without projectId', async () => {
  store.dispatch(projectActions.setCurrentProject(null));
  store.dispatch(actions.getBuilds());
  let state = store.getState().builds;
  expect(state.builds).toHaveLength(0);
  expect(ApolloClient.query).not.toHaveBeenCalled();
});

test('setCurrentBuild', () => {
  store.dispatch(actions.setCurrentBuild('1'));
  expect(store.getState().builds.currentBuildId).toBe('1');
});

test('getBuilds', async () => {
  let resolver;
  ApolloClient.query = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () => resolver(buildsData);
  store.dispatch(actions.getBuilds());
  let state = store.getState().builds;
  expect(ApolloClient.query).toHaveBeenCalled();
  expect(state.isLoading).toBe(true);
  await resolvePromise();
  state = store.getState().builds;
  expect(state.isLoading).toBe(false);
  expect(state.error).toBe('');
  expect(state.builds).toHaveLength(5);
  state = store.getState().builds;
  expect(state.pageInfo.hasNextPage).toBe(true);
  expect(state.currentCursor).toEqual(
    'MTU1NzEwMjM5MTk2Mw==:ZjAyNDI5OTItMzFjNy00YjEwLWJhMjItMTRiMjllZDgzYWQ4',
  );
});

test('getBuild', async () => {
  let resolver;
  ApolloClient.query = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () => resolver(buildData);

  const promise = store.dispatch(
    actions.getBuild('f0242992-31c7-4b10-ba22-14b29ed83ad8'),
  );
  let state = store.getState().builds;
  expect(state.isLoadingSingle).toBe(true);
  await resolvePromise();
  await promise;
  state = store.getState().builds;
  expect(state.isLoadingSingle).toBe(false);
  expect(state.error).toBe('');
  expect(state.builds).toHaveLength(1);
  expect(snapshotActions.getSnapshots).toHaveBeenCalledTimes(1);
  expect(snapshotActions.getSnapshotGroups).toHaveBeenCalledTimes(1);
});

test('getBuild updates build', async () => {
  const builds = [{ id: '1' }, { id: '2' }, { id: '3' }];
  store.dispatch(actions.receiveBuilds(builds));
  buildData.data.build.id = '1';
  ApolloClient.query = jest.fn(() => Promise.resolve(buildData));
  await store.dispatch(actions.getBuild('1'));
  expect(ApolloClient.query).toHaveBeenCalledTimes(1);
  const state = store.getState().builds;
  expect(state.error).toBe('');
  expect(state.builds[0]).toEqual(buildData.data.build);
  expect(state.builds).toHaveLength(3);
});

test('getBuild updates project and organization', async () => {
  store.dispatch(organizationActions.receiveOrganizations([]));
  store.dispatch(projectActions.setCurrentProject(null));
  organizationActions.changeOrganization = jest.fn(() => () => {});
  projectActions.changeProject = jest.fn(() => () => {});
  ApolloClient.query = jest.fn(() => Promise.resolve(buildData));
  await store.dispatch(actions.getBuild('1'));
  expect(ApolloClient.query).toHaveBeenCalledTimes(1);
  const state = store.getState().builds;
  expect(state.error).toBe('');
  expect(organizationActions.changeOrganization).toHaveBeenCalledTimes(1);
  expect(projectActions.changeProject).toHaveBeenCalledTimes(1);
  expect(state.builds[0]).toEqual(buildData.data.build);
  expect(state.builds).toHaveLength(1);
});

test('changeBuild', async () => {
  ApolloClient.query = jest.fn(() => Promise.resolve(buildData));
  await store.dispatch(actions.changeBuild({ id: '1234' }));
  expect(ApolloClient.query).toHaveBeenCalledTimes(1);
  const state = store.getState().builds;
  expect(state.builds).toHaveLength(1);
});

test('changeBuild doesnt get new build if its already the current build', async () => {
  ApolloClient.query = jest.fn(() => Promise.resolve());
  store.dispatch(actions.setCurrentBuild('1'));
  await store.dispatch(actions.changeBuild({ id: '1' }));
  expect(ApolloClient.query).not.toHaveBeenCalled();
  const state = store.getState().builds;
  expect(state.builds).toHaveLength(0);
});

test('updateApprovedSnapshots', async () => {
  buildData.data.build.id = '1';
  buildData.data.build.modifiedSnapshots = 25;
  store.dispatch(actions.receiveBuilds([buildData.data.build]));
  store.dispatch(actions.setCurrentBuild('1'));
  store.dispatch(actions.updateApprovedSnapshots(-1));
  let state = store.getState().builds;
  expect(state.builds[0].approvedSnapshots).toEqual(25);
  store.dispatch(actions.updateBuild({ id: '1', approvedSnapshots: 0 }));
  store.dispatch(actions.updateApprovedSnapshots(5));
  state = store.getState().builds;
  expect(state.builds[0].approvedSnapshots).toEqual(5);
  store.dispatch(actions.updateBuild({ id: '1', approvedSnapshots: 0 }));
  store.dispatch(actions.updateApprovedSnapshots(100));
  state = store.getState().builds;
  expect(state.builds[0].approvedSnapshots).toEqual(25);
});

test('loadMore', async () => {
  let resolver;
  ApolloClient.query = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () => resolver(buildsData);
  const loadMore = store.dispatch(actions.loadMore());

  let state = store.getState().builds;
  expect(ApolloClient.query).toHaveBeenCalled();
  expect(state.isLoadingMore).toBe(true);
  await resolvePromise();
  await loadMore;

  state = store.getState().builds;
  expect(state.isLoadingMore).toBe(false);
  expect(state.error).toBe('');
  expect(state.builds).toHaveLength(5);
  expect(state.pageInfo.hasNextPage).toBe(true);
  expect(state.currentCursor).toEqual(
    'MTU1NzEwMjM5MTk2Mw==:ZjAyNDI5OTItMzFjNy00YjEwLWJhMjItMTRiMjllZDgzYWQ4',
  );
});

test('setLocationKey', async () => {
  store.dispatch(actions.setLocationKey('123abc'));
  const state = store.getState().builds;
  expect(state.locationKey).toBe('123abc');
});

test('checkLocationKey', async () => {
  store.dispatch(actions.setLocationKey('123abc'));
  store.dispatch(actions.checkLocationKey('123abc'));
  let state = store.getState().builds;
  expect(state.locationKey).toBe('123abc');
  expect(snapshotActions.setCurrentSnapshot).not.toHaveBeenCalled();

  store.dispatch(actions.checkLocationKey('newkey'));
  state = store.getState().builds;
  expect(state.locationKey).toBe('newkey');
  expect(snapshotActions.setCurrentSnapshot).toHaveBeenCalledTimes(1);
});

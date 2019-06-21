jest.mock('../../graphql/client.js', () => ({
  mutate: jest.fn(),
  query: jest.fn(),
  resetStore: jest.fn(),
}));
import * as actions from './actions.js';
import * as buildActions from '../builds/actions.js';
import * as organizationActions from '../organizations/actions.js';
import * as projectActions from '../projects/actions.js';
import ApolloClient from '../../graphql/client.js';

let store;
let snapshotData;
let snapshotsData;
let groupsData;
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
        provider: null,
        repoActive: null,
        repoName: null,
        repoOwner: null,
        slackActive: null,
        slackVariable: null,
        slackWebhook: null,
      },
    ]),
  );
  store.dispatch(projectActions.setCurrentProject('12345'));
  store.dispatch(
    buildActions.receiveBuilds([
      {
        id: '54321',
        number: 68,
        branch: 'master',
        commitSha: '123sa',
        commitMessage: 'yeah',
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
      },
    ]),
  );
  store.dispatch(buildActions.setCurrentBuild('54321'));
  groupsData = {
    totalCount: 4,
    edges: [
      {
        node: {
          approvedSnapshots: 0,
          group: 1,
          snapshots: {
            totalCount: 2,
            pageInfo: {
              hasNextPage: false,
              __typename: 'PageInfo',
            },
            edges: [
              {
                cursor:
                  'MTU2MDYyNDc1MTU1OA==:ZmY0NjBmZDQtNWY3Mi00NDc1LWE0ZmEtMjhlNDQwM2VhZTYy',
                node: {
                  id: 'ff460fd4-5f72-4475-a4fa-28e4403eae62',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/6bf07018d81b40a2ac8a689c1266c481.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'Remove member dialog',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: '4a79c234-2e2c-4db1-81cc-91394ea94d88',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/2ec07b3555204272bf87f96404268c02.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: '4a79c234-2e2c-4db1-81cc-91394ea94d88',
                    snapshotToId: 'ff460fd4-5f72-4475-a4fa-28e4403eae62',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/Remove member dialog-c3db3bf53ed0495fbe7ef18dca7e02cf.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
              {
                cursor:
                  'MTU2MDYyNDc1MTYwNQ==:Yzk4NTMxZTMtNWEzZi00ZWZlLWE2NDAtNmIzNDUzMzEzMThh',
                node: {
                  id: 'c98531e3-5a3f-4efe-a640-6b345331318a',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/e7f6d76bd09e48ad823be88ec538cdbc.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'Invite member dialog',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: '9e02ff61-c81f-4704-aee1-1c6f167ddc68',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/b85ac703625e4c9492d4973e756e6035.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: '9e02ff61-c81f-4704-aee1-1c6f167ddc68',
                    snapshotToId: 'c98531e3-5a3f-4efe-a640-6b345331318a',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/Invite member dialog-31ad1e70bfb849c48f89e5594124f822.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
            ],
            __typename: 'SnapshotConnection',
          },
          __typename: 'SnapshotGroup',
        },
        __typename: 'SnapshotGroupEdge',
      },
      {
        node: {
          approvedSnapshots: 0,
          group: 2,
          snapshots: {
            totalCount: 4,
            pageInfo: {
              hasNextPage: false,
              __typename: 'PageInfo',
            },
            edges: [
              {
                cursor:
                  'MTU2MDYyNDc1MTQzMw==:MjhhNTQzOGEtYjEwYi00MWIxLWI2Y2YtNTY5OTI4YzdmNjZk',
                node: {
                  id: '28a5438a-b10b-41b1-b6cf-569928c7f66d',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/fa008c68b9a94716a0baa8a7f9f9a7ff.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'Create organization page',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: 'c277d18a-d43c-415c-b12b-9df2c0b6d6f7',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/5d023716c5004f4ea40dabc54393724a.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: 'c277d18a-d43c-415c-b12b-9df2c0b6d6f7',
                    snapshotToId: '28a5438a-b10b-41b1-b6cf-569928c7f66d',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/Create organization page-bc955e6ef2d24eef8510e8363ba04ed8.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
              {
                cursor:
                  'MTU2MDYyNDc1MTc5OQ==:NmRlZTg1MzEtNDVhOS00MGJhLWJiNTEtZDUwZGU5MGY2Yjgz',
                node: {
                  id: '6dee8531-45a9-40ba-bb51-d50de90f6b83',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/a370312d7aeb411d9c080f6ae8a0a915.html.png',
                  approved: false,
                  approvedOn: null,
                  title: '404 page',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: '9f4a7932-72a4-47a9-9490-f689c1ae27a2',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/5bf60fe544e149cba3e159399894b44e.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: '9f4a7932-72a4-47a9-9490-f689c1ae27a2',
                    snapshotToId: '6dee8531-45a9-40ba-bb51-d50de90f6b83',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/404 page-31235863a53b418eae79b7993c52c7c7.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
              {
                cursor:
                  'MTU2MDYyNDc1MTgzOA==:MzgxODIwOTctZWE4MC00ZTAxLTk0ZTgtOTI5OGQ5ZjdmODM4',
                node: {
                  id: '38182097-ea80-4e01-94e8-9298d9f7f838',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/8eed312956054c5bb6b898184e3006a8.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'profile page',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: 'f6bb2f4a-d4a0-47f4-b5f6-7b411e76aa02',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/4b0cb59de760403a8b997e3630cb71b4.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: 'f6bb2f4a-d4a0-47f4-b5f6-7b411e76aa02',
                    snapshotToId: '38182097-ea80-4e01-94e8-9298d9f7f838',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/profile page-197ef094987b4dc2ae8585a774450b84.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
              {
                cursor:
                  'MTU2MDYyNDc1MTg5Mw==:YzNhYjYzYjQtM2MyYi00ODQ1LThhNmQtYjE2MWZlMjA2YTU5',
                node: {
                  id: 'c3ab63b4-3c2b-4845-8a6d-b161fe206a59',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/31dc53e86f7e406ca6a6811499893af3.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'profile page - edit name',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: '1a5c40de-5ecd-4155-affa-2a532120c9ba',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/4ab7ce3aa04b441c801206f0725a3feb.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: '1a5c40de-5ecd-4155-affa-2a532120c9ba',
                    snapshotToId: 'c3ab63b4-3c2b-4845-8a6d-b161fe206a59',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/profile page - edit name-7647a4b15de749bbb9673a76889cb483.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
            ],
            __typename: 'SnapshotConnection',
          },
          __typename: 'SnapshotGroup',
        },
        __typename: 'SnapshotGroupEdge',
      },
      {
        node: {
          approvedSnapshots: 0,
          group: 3,
          snapshots: {
            totalCount: 5,
            pageInfo: {
              hasNextPage: false,
              __typename: 'PageInfo',
            },
            edges: [
              {
                cursor:
                  'MTU2MDYyNDc1MTE4OA==:Y2ExM2Q3MDUtZmRjNy00ZmUwLWFhOTktZGJjNmU0MGYyMDdm',
                node: {
                  id: 'ca13d705-fdc7-4fe0-aa99-dbc6e40f207f',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/b3972527184e4ef1856c59305f3b857e.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'Project list - empty',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: '9cc31256-378c-4997-9de3-793629b78029',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/fd8bdd00c75e443c9e1fe398dbad51d5.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: '9cc31256-378c-4997-9de3-793629b78029',
                    snapshotToId: 'ca13d705-fdc7-4fe0-aa99-dbc6e40f207f',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/Project list - empty-aee7ad022db741fba722aeff69a88c09.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
              {
                cursor:
                  'MTU2MDYyNDc1MTIzNw==:MjY5NDU5NGQtMTBlMS00ZTgxLTg1NDQtZjEzNDUxMzdhZTUw',
                node: {
                  id: '2694594d-10e1-4e81-8544-f1345137ae50',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/adcaf1b2a16e4ec4a1d11bac93b60ea6.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'Create project',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: 'bf63102a-b4b8-42e0-ac39-6a6ccad46e4e',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/0e29755a73414f42b154e5bf4489a47c.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: 'bf63102a-b4b8-42e0-ac39-6a6ccad46e4e',
                    snapshotToId: '2694594d-10e1-4e81-8544-f1345137ae50',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/Create project-b8b58688ee9a446d854944ce132050f9.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
              {
                cursor:
                  'MTU2MDYyNDc1MTI4NA==:NzE4ZGM0MjAtMWZhYy00NmI2LWIwMDgtMjRiMDFmYjYzNjMx',
                node: {
                  id: '718dc420-1fac-46b6-b008-24b01fb63631',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/b71d0ce73db7439fb78dc4b241763b18.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'Project list',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: '45027639-9f9f-464d-8a59-50832582ae1a',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/8a06f66f33244be8b196f34447ae703b.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: '45027639-9f9f-464d-8a59-50832582ae1a',
                    snapshotToId: '718dc420-1fac-46b6-b008-24b01fb63631',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/Project list-1032d08f3e414de795596ad7d6ca15e3.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
              {
                cursor:
                  'MTU2MDYyNDc1MTM0NA==:ZjA4MDE2OGUtNzA5Ny00OWQ0LTg4MDEtNDg2MTA1MjBiOGQ3',
                node: {
                  id: 'f080168e-7097-49d4-8801-48610520b8d7',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/338f5dcf4c4c4b5083fc77a732ce776a.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'Project configuration',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: '37fddd6c-4e94-4e86-bfbd-11a54e473a61',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/2da3014760744a96af0b413e0ea52473.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: '37fddd6c-4e94-4e86-bfbd-11a54e473a61',
                    snapshotToId: 'f080168e-7097-49d4-8801-48610520b8d7',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/Project configuration-1b258acad4c6403b81db3a3cc6e98c5f.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
              {
                cursor:
                  'MTU2MDYyNDc1MTM4OQ==:M2FiZmVlNzYtNmU1My00YWRmLTkwOWQtOWNmOTY2ODVlMGFh',
                node: {
                  id: '3abfee76-6e53-4adf-909d-9cf96685e0aa',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/144219282eee4db090d39c2057fc7acb.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'Project configuration - filled',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: '82ebd1d1-1f54-4bd2-bb9b-2cc4a0bf70a2',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/0498146ef7934524949a641da4b78eb4.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: '82ebd1d1-1f54-4bd2-bb9b-2cc4a0bf70a2',
                    snapshotToId: '3abfee76-6e53-4adf-909d-9cf96685e0aa',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/Project configuration - filled-67ea2c63b6c043b39f116a8da13ce964.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
            ],
            __typename: 'SnapshotConnection',
          },
          __typename: 'SnapshotGroup',
        },
        __typename: 'SnapshotGroupEdge',
      },
      {
        node: {
          approvedSnapshots: 0,
          group: null,
          snapshots: {
            totalCount: 4,
            pageInfo: {
              hasNextPage: false,
              __typename: 'PageInfo',
            },
            edges: [
              {
                cursor:
                  'MTU2MDYyNDc1MTQ3Nw==:MzQxYmNmZTktZDEwOC00NTJhLTg3ZjgtMmIyZjZhZmEyN2Y1',
                node: {
                  id: '341bcfe9-d108-452a-87f8-2b2f6afa27f5',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/3504079231c645fb847a576d57f47c1d.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'Organization page',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: '7256ec32-cda2-4341-9fdd-08c80221696a',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/c7b1de4fc1b14e54888b5a591d58c7b8.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: '7256ec32-cda2-4341-9fdd-08c80221696a',
                    snapshotToId: '341bcfe9-d108-452a-87f8-2b2f6afa27f5',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/Organization page-8826995dd5354141adb5e486994c6df1.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
              {
                cursor:
                  'MTU2MDYyNDc1MTUxOA==:NTFjNTY1NGItZDUyOC00YmE3LTg4MzItODkyODY2N2RmZWI0',
                node: {
                  id: '51c5654b-d528-4ba7-8832-8928667dfeb4',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/4e890bfaeea64f9cb71deafbcf51c2ad.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'Member added',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: '2585db6f-87de-438a-8b82-09e97b09ea03',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/520feae43cb04770839951a84cb1f9cb.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: '2585db6f-87de-438a-8b82-09e97b09ea03',
                    snapshotToId: '51c5654b-d528-4ba7-8832-8928667dfeb4',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/Member added-927b99ed67b940a0a0d84fa3ea12e5b4.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
              {
                cursor:
                  'MTU2MDYyNDc1MTY5Mg==:ZDY0YWU5YTktMmQxYy00NWU5LThmNWQtMGU2MDYzYmI4M2Qx',
                node: {
                  id: 'd64ae9a9-2d1c-45e9-8f5d-0e6063bb83d1',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/fa8003e24b004eb0881829beba5af2f9.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'Invites',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: 'eb981e32-aac3-4c28-ab0e-8187ee6fc9c8',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/2481d0c22c614b93979e23c7472a6ac8.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: 'eb981e32-aac3-4c28-ab0e-8187ee6fc9c8',
                    snapshotToId: 'd64ae9a9-2d1c-45e9-8f5d-0e6063bb83d1',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/Invites-3867934d317643d5a349005d28ecf8cb.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
              {
                cursor:
                  'MTU2MDYyNDc1MTc0NA==:YTdjZDljN2YtYWIyYy00YmZjLTg5MzEtY2M1YmRlYWM5NDQw',
                node: {
                  id: 'a7cd9c7f-ab2c-4bfc-8931-cc5bdeac9440',
                  imageLocation:
                    'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/screenshots/firefox/1280/bdfb7afcffd141abb245e4b968cf2df3.html.png',
                  approved: false,
                  approvedOn: null,
                  title: 'Delete invite dialog',
                  width: 1280,
                  browser: 'firefox',
                  diff: true,
                  approvedBy: null,
                  previousApproved: {
                    id: '7ca4b935-d160-4937-a66a-c7aa6eecb1fa',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/aa158a24-c25c-4e32-9d46-6d00c3e645ab/screenshots/firefox/1280/a12383f9a42644f58c4cc2dc07dc4e92.html.png',
                    approved: false,
                    approvedOn: null,
                    approvedBy: null,
                    __typename: 'Snapshot',
                  },
                  snapshotDiff: {
                    snapshotFromId: '7ca4b935-d160-4937-a66a-c7aa6eecb1fa',
                    snapshotToId: 'a7cd9c7f-ab2c-4bfc-8931-cc5bdeac9440',
                    imageLocation:
                      'http://url//c7986a42-c688-465d-9326-c0fc02d58eed/52323b7b-f0cd-4583-8764-60a78e73377f/1cae0a37-162b-448d-92fc-270d9f305794/diff/1280/Delete invite dialog-91b3558199c7431398c4e645524b196f.png',
                    __typename: 'SnapshotDiff',
                  },
                  __typename: 'Snapshot',
                },
                __typename: 'SnapshotEdge',
              },
            ],
            __typename: 'SnapshotConnection',
          },
          __typename: 'SnapshotGroup',
        },
        __typename: 'SnapshotGroupEdge',
      },
    ],
    __typename: 'SnapshotGroupConnection',
  };
  snapshotData = {
    id: '4',
    approved: false,
    approvedBy: null,
    approvedOn: null,
    browser: 'chrome',
    diff: false,
    imageLocation: 'location-to-snapshot-image-4',
    previousApproved: null,
    snapshotDiff: null,
    title: 'Project list - all',
    width: 1280,
    __typename: 'Snapshot',
  };
  snapshotsData = {
    edges: [
      {
        cursor:
          'MTU1NzcxODkwNDYyNw==:YjgyMGVhMzEtZTlkNS00N2M4LWIyN2ItOTA4NTUyMmRkODky',
        node: {
          id: '1',
          approved: false,
          approvedBy: null,
          approvedOn: null,
          browser: 'chrome',
          diff: false,
          imageLocation: 'location-to-snapshot-image',
          previousApproved: null,
          snapshotDiff: null,
          title: 'Project list - empty',
          width: 1280,
          __typename: 'Snapshot',
        },
      },
      {
        cursor:
          'MTU1NzcxODkwNDc4MA==:NGZjNDlhZGUtODlmMS00ZTAwLWJhNzYtZDY2Y2ZkOThjOWFj',
        node: {
          id: '2',
          approved: false,
          approvedBy: null,
          approvedOn: null,
          browser: 'chrome',
          diff: false,
          imageLocation: 'location-to-snapshot-image-2',
          previousApproved: null,
          snapshotDiff: null,
          title: 'Project list - filled',
          width: 1280,
          __typename: 'Snapshot',
        },
      },
      {
        cursor:
          'MTU1NzcxODkwNDg1Ng==:MmE4NGRlYjEtYzI3ZC00NzI0LTlhY2QtYjE4ZmJkMjNhOTY0',
        node: {
          id: '3',
          approved: false,
          approvedBy: null,
          approvedOn: null,
          browser: 'chrome',
          diff: false,
          imageLocation: 'location-to-snapshot-image-3',
          previousApproved: null,
          snapshotDiff: null,
          title: 'Project list - error',
          width: 1280,
          __typename: 'Snapshot',
        },
      },
    ],
    pageInfo: {
      hasNextPage: true,
    },
  };
});

test('setError', () => {
  store.dispatch(actions.setError('oops'));
  const { snapshots } = store.getState();
  expect(snapshots.error).toBe('oops');
});

test.each([['new'], ['modified'], ['unmodified'], ['removed']])(
  '%s isLoading',
  type => {
    store.dispatch(actions.isLoading(type));
    const { snapshots } = store.getState();
    expect(snapshots.isLoading[type]).toBe(true);
  },
);

test.each([['new'], ['modified'], ['unmodified'], ['removed']])(
  '%s doneLoading',
  type => {
    store.dispatch(actions.doneLoading(type));
    const { snapshots } = store.getState();
    expect(snapshots.isLoading[type]).toBe(false);
  },
);

test.each([['new'], ['modified'], ['unmodified'], ['removed']])(
  '%s isLoadingMore',
  type => {
    store.dispatch(actions.isLoadingMore(type));
    const { snapshots } = store.getState();
    expect(snapshots.isLoadingMore[type]).toBe(true);
  },
);

test.each([['new'], ['modified'], ['unmodified'], ['removed']])(
  '%s doneLoadingMore',
  type => {
    store.dispatch(actions.doneLoadingMore(type));
    const { snapshots } = store.getState();
    expect(snapshots.isLoadingMore[type]).toBe(false);
  },
);

test('isApproving', () => {
  store.dispatch(actions.isApproving());
  const { snapshots } = store.getState();
  expect(snapshots.isApproving).toBe(true);
});

test('doneApproving', () => {
  store.dispatch(actions.doneApproving());
  const { snapshots } = store.getState();
  expect(snapshots.isApproving).toBe(false);
});

test('receiveSnapshots', () => {
  const snapshots = snapshotsData.edges.map(s => s.node);
  store.dispatch(actions.receiveSnapshots('new', snapshots));
  const state = store.getState().snapshots;
  expect(state.snapshots['new']).toEqual(snapshots);
});

test('addSnapshot', () => {
  const snapshots = snapshotsData.edges.map(s => s.node);
  store.dispatch(actions.receiveSnapshots('new', snapshots));
  store.dispatch(actions.addSnapshot('new', snapshotData));
  const state = store.getState().snapshots;
  expect(state.snapshots['new']).toHaveLength(4);
});

test('addSnapshots', () => {
  const snapshots = snapshotsData.edges.map(s => s.node);
  store.dispatch(actions.addSnapshots('unmodified', snapshots));
  const state = store.getState().snapshots;
  expect(state.snapshots['unmodified']).toEqual(snapshots);
});

test('approveSnapshots', () => {
  store.dispatch(actions.receiveGroups(groupsData.edges.map(e => e.node)));
  store.dispatch(
    actions.approveSnapshots({
      approved: true,
    }),
  );
  const state = store.getState().snapshots;
  const approvedSnapshots = state.groups.map(g => g.approvedSnapshots);
  const totalCount = state.groups.map(g => g.snapshots.totalCount);
  expect(approvedSnapshots).toEqual(totalCount);
  const countOfApproved = state.groups.map(
    g => g.snapshots.edges.filter(e => e.node.approved).map(() => true).length,
  );
  expect(countOfApproved).toEqual(totalCount);
});

test.each([['new'], ['modified'], ['unmodified'], ['removed']])(
  '%type updatePageInfo',
  type => {
    store.dispatch(
      actions.updatePageInfo(type, {
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
    let state = store.getState().snapshots;
    expect(state.pageInfo[type].hasNextPage).toBe(true);
    expect(state.currentCursor[type]).toBe('4');
    store.dispatch(
      actions.updatePageInfo(type, {
        pageInfo: {
          hasNextPage: false,
        },
        edges: [],
      }),
    );
    state = store.getState().snapshots;
    expect(state.pageInfo[type].hasNextPage).toBe(false);
    expect(state.currentCursor[type]).toBeNull();
  },
);

test('updateSnapshot', () => {
  const snapshots = snapshotsData.edges.map(s => s.node);
  store.dispatch(actions.receiveSnapshots('unmodified', snapshots));
  store.dispatch(
    actions.updateSnapshot('unmodified', {
      id: '1',
      approved: true,
    }),
  );
  const state = store.getState().snapshots;
  expect(state.snapshots['unmodified'].filter(s => s.approved)).toHaveLength(1);
});

test('setCurrentSnapshot', () => {
  store.dispatch(actions.setCurrentSnapshot('1'));
  expect(store.getState().snapshots.currentSnapshotId).toBe('1');
});

test('getSnapshots without buildId', async () => {
  store.dispatch(buildActions.setCurrentBuild(null));
  store.dispatch(actions.getSnapshots('unmodified'));
  let state = store.getState().snapshots;
  expect(state.snapshots['unmodified']).toHaveLength(0);
  expect(ApolloClient.query).not.toHaveBeenCalled();
});

test('getSnapshots', async () => {
  let resolver;
  ApolloClient.query = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () => resolver({ data: { snapshots: snapshotsData } });
  store.dispatch(actions.getSnapshots('modified'));
  let state = store.getState().snapshots;
  expect(ApolloClient.query).toHaveBeenCalled();
  expect(state.isLoading['modified']).toBe(true);
  await resolvePromise();
  state = store.getState().snapshots;
  expect(state.isLoading['modified']).toBe(false);
  expect(state.error).toBe('');
  expect(state.snapshots['modified']).toHaveLength(3);
  expect(state.pageInfo['modified'].hasNextPage).toBe(true);
  expect(state.currentCursor['modified']).toEqual(
    'MTU1NzcxODkwNDg1Ng==:MmE4NGRlYjEtYzI3ZC00NzI0LTlhY2QtYjE4ZmJkMjNhOTY0',
  );
});

test('getSnapshot', async () => {
  let resolver;
  ApolloClient.query = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () => resolver({ data: { snapshot: snapshotData } });

  const promise = store.dispatch(actions.getSnapshot('5'));
  let state = store.getState().snapshots;
  expect(state.isLoading['single']).toBe(true);
  await resolvePromise();
  await promise;
  state = store.getState().snapshots;
  expect(state.isLoading['single']).toBe(false);
  expect(state.error).toBe('');
  expect(state.snapshots['single']).toHaveLength(1);
});

test('getSnapshot updates snapshot', async () => {
  const snapshots = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
  store.dispatch(actions.receiveSnapshots('single', snapshots));
  ApolloClient.query = jest.fn(() =>
    Promise.resolve({ data: { snapshot: snapshotData } }),
  );
  await store.dispatch(actions.getSnapshot('1'));
  expect(ApolloClient.query).toHaveBeenCalledTimes(1);
  const state = store.getState().snapshots;
  expect(state.error).toBe('');
  expect(state.snapshots['single'][3]).toEqual(snapshotData);
  expect(state.snapshots['single']).toHaveLength(4);
});

test('getSnapshot updates build, project and organization', async () => {
  store.dispatch(organizationActions.receiveOrganizations([]));
  store.dispatch(projectActions.setCurrentProject(null));
  store.dispatch(buildActions.setCurrentBuild(null));
  organizationActions.changeOrganization = jest.fn(() => () => {});
  projectActions.changeProject = jest.fn(() => () => {});
  buildActions.changeBuild = jest.fn(() => () => {});
  snapshotData.projectId = '10';
  snapshotData.buidlId = '11';
  snapshotData.organizationId = '12';
  ApolloClient.query = jest.fn(() =>
    Promise.resolve({ data: { snapshot: snapshotData } }),
  );
  await store.dispatch(actions.getSnapshot('1'));
  expect(ApolloClient.query).toHaveBeenCalledTimes(1);
  const state = store.getState().snapshots;
  expect(state.error).toBe('');
  expect(organizationActions.changeOrganization).toHaveBeenCalledTimes(1);
  expect(projectActions.changeProject).toHaveBeenCalledTimes(1);
  expect(buildActions.changeBuild).toHaveBeenCalledTimes(1);
  expect(state.snapshots['single'][0]).toEqual(snapshotData);
  expect(state.snapshots['single']).toHaveLength(1);
});

test('changeSnapshot', async () => {
  await store.dispatch(actions.changeSnapshot({ id: '1234' }));
  const state = store.getState().snapshots;
  expect(state.currentSnapshotId).toBe('1234');
});

test('approveSnapshot', async () => {
  buildActions.updateApprovedSnapshots = jest.fn(() => () => {});
  const snapshotData = groupsData.edges[0].node.snapshots.edges[0].node;
  const group = groupsData.edges[0].node;
  snapshotData.approved = true;
  store.dispatch(actions.receiveGroups(groupsData.edges.map(e => e.node)));

  let resolver;
  ApolloClient.mutate = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () =>
    resolver({ data: { approveSnapshot: snapshotData } });
  const approved = store.dispatch(
    actions.approveSnapshot({ group, snapshot: { id: snapshotData.id } }),
  );
  let state = store.getState().snapshots;
  expect(state.isApproving).toBe(true);
  await resolvePromise();
  await approved;
  expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
  state = store.getState().snapshots;
  expect(state.error).toBe('');
  expect(state.isApproving).toBe(false);
  expect(buildActions.updateApprovedSnapshots).toHaveBeenCalledWith(1);
  expect(buildActions.updateApprovedSnapshots).toHaveBeenCalledTimes(1);
  expect(state.groups[0].snapshots.edges[0].node).toEqual(snapshotData);
});

test('approveGroupSnapshots', async () => {
  buildActions.updateApprovedSnapshots = jest.fn(() => () => {});
  const snapshotData = groupsData.edges[0].node.snapshots.edges[0].node;
  const group = groupsData.edges[0].node;
  snapshotData.approved = true;
  store.dispatch(actions.receiveGroups(groupsData.edges.map(e => e.node)));

  let resolver;
  ApolloClient.mutate = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () =>
    resolver({ data: { approveGroupSnapshots: true } });
  const approved = store.dispatch(actions.approveGroupSnapshots(group));
  let state = store.getState().snapshots;
  expect(state.isApproving).toBe(true);
  await resolvePromise();
  await approved;
  expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
  state = store.getState().snapshots;
  expect(state.error).toBe('');
  expect(state.isApproving).toBe(false);
  expect(buildActions.updateApprovedSnapshots).toHaveBeenCalledWith(2);
  expect(buildActions.updateApprovedSnapshots).toHaveBeenCalledTimes(1);
  expect(
    state.groups[0].snapshots.edges.some(e => e.node.approved === false),
  ).toBe(false);
});

test('approveAllSnapshots', async () => {
  buildActions.updateApprovedSnapshots = jest.fn(() => () => {});
  store.dispatch(actions.receiveGroups(groupsData.edges.map(e => e.node)));

  let resolver;
  ApolloClient.mutate = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () =>
    resolver({ data: { approveSnapshots: snapshotsData } });
  const approved = store.dispatch(actions.approveAllSnapshots());
  let state = store.getState().snapshots;
  expect(state.isApproving).toBe(true);
  await resolvePromise();
  await approved;
  expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
  state = store.getState().snapshots;
  expect(state.error).toBe('');
  expect(state.isApproving).toBe(false);
  expect(buildActions.updateApprovedSnapshots).toHaveBeenCalledWith(-1);
  expect(buildActions.updateApprovedSnapshots).toHaveBeenCalledTimes(1);
});

test('loadMore', async () => {
  let resolver;
  ApolloClient.query = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () => resolver({ data: { snapshots: snapshotsData } });
  const loadMore = store.dispatch(actions.loadMore('unmodified'));

  let state = store.getState().snapshots;
  expect(ApolloClient.query).toHaveBeenCalled();
  expect(state.isLoadingMore['unmodified']).toBe(true);
  await resolvePromise();
  await loadMore;

  state = store.getState().snapshots;
  expect(state.isLoadingMore['unmodified']).toBe(false);
  expect(state.error).toBe('');
  expect(state.snapshots['unmodified']).toHaveLength(3);
  expect(state.pageInfo['unmodified'].hasNextPage).toBe(true);
  expect(state.currentCursor['unmodified']).toEqual(
    'MTU1NzcxODkwNDg1Ng==:MmE4NGRlYjEtYzI3ZC00NzI0LTlhY2QtYjE4ZmJkMjNhOTY0',
  );
});

test('clearSnapshots', () => {
  const snapshots = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
  store.dispatch(actions.receiveSnapshots('new', snapshots));
  store.dispatch(actions.receiveSnapshots('single', snapshots));
  store.dispatch(actions.receiveSnapshots('unmodified', snapshots));
  store.dispatch(actions.receiveSnapshots('removed', snapshots));

  store.dispatch(actions.clearSnapshots());

  const state = store.getState().snapshots;
  expect(state.snapshots.single).toHaveLength(4);
  expect(state.snapshots.new).toHaveLength(0);
  expect(state.snapshots.unmodified).toHaveLength(0);
  expect(state.snapshots.removed).toHaveLength(0);
});

test('addSnapshotFlake', async () => {
  const snapshotData = groupsData.edges[0].node.snapshots.edges[0].node;
  const group = groupsData.edges[0].node;
  store.dispatch(actions.receiveGroups(groupsData.edges.map(e => e.node)));

  const snapshotFlake = {
    id: '1',
    imageLocation: 'location',
    createdBy: {
      user: {
        id: '1',
        name: 'Test mctester',
      },
    },
  };
  let resolver;
  ApolloClient.mutate = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () =>
    resolver({ data: { addSnapshotFlake: snapshotFlake } });
  const approved = store.dispatch(
    actions.addSnapshotFlake({ group, snapshot: { id: snapshotData.id } }),
  );
  let state = store.getState().snapshots;
  expect(state.isAddingSnapshotFlake).toBe(true);
  await resolvePromise();
  await approved;
  expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
  state = store.getState().snapshots;
  expect(state.error).toBe('');
  expect(state.isAddingSnapshotFlake).toBe(false);
  expect(state.groups[0].snapshots.edges[0].node.snapshotFlake).toBe(snapshotFlake);
});

test('loadMoreFromGroup', async () => {
  const group = groupsData.edges[0].node;
  store.dispatch(actions.receiveGroups(groupsData.edges.map(e => e.node)));
  let resolver;
  ApolloClient.query = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () => resolver({ data: { modifiedSnapshots: snapshotsData } });
  const loadMore = store.dispatch(actions.loadMoreFromGroup(group));

  let state = store.getState().snapshots;
  expect(ApolloClient.query).toHaveBeenCalled();
  expect(state.isLoadingMoreFromGroup['1']).toBe(true);
  await resolvePromise();
  await loadMore;

  state = store.getState().snapshots;
  expect(state.isLoadingMoreFromGroup['1']).toBe(false);
  expect(state.error).toBe('');
  expect(state.groups[0].snapshots.edges).toHaveLength(5);
});


test('getSnapshotGroups', async () => {
  let resolver;
  ApolloClient.query = jest.fn(
    () => new Promise(resolve => (resolver = resolve)),
  );
  const resolvePromise = () => resolver({ data: { modifiedSnapshotGroups: groupsData } });

  const promise = store.dispatch(actions.getSnapshotGroups());
  let state = store.getState().snapshots;
  expect(state.isLoadingGroups).toBe(true);
  await resolvePromise();
  await promise;
  state = store.getState().snapshots;
  expect(state.isLoadingGroups).toBe(false);
  expect(state.error).toBe('');
  expect(state.groups).toEqual(groupsData.edges.map(e => e.node));
});
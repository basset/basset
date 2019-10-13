import React from 'react';
import { act } from 'react-dom/test-utils';
import { cleanup } from 'react-testing-library';
import { store, renderApp } from '../../../tests/render-redux.js';

import * as snapshotActions from '../../../redux/snapshots/actions.js';

import SnapshotHistory from './controller.jsx';

afterEach(cleanup);
jest.useFakeTimers();

let snapshotData;
describe('<SnapshotHistory />', () => {
  beforeEach(() => {
    snapshotData = [
      {
        cursor:
          'MTU2MjM5MjQ3MjgwOQ==:MjYwYjE3ZGQtOGJmYi00ZWQzLTgxNjgtZDU5YmY4MTdiMzQz',
        node: {
          id: '260b17dd-8bfb-4ed3-8168-d59bf817b343',
          imageLocation:
            'http://192.168.39.61:30462/screenshots.basset.io/c7986a42-c688-465d-9326-c0fc02d58eed/c671ae78-1ce4-4f2b-b696-1553201053e9/f50e37ee-6867-453e-9763-a9fbf603c6ff/screenshots/firefox/1280/60284b23b33c47dfb26df43582b29584.html.png',
          approved: true,
          approvedOn: '1562393001355',
          title: 'index',
          width: 1280,
          browser: 'firefox',
          diff: true,
          buildId: 'f50e37ee-6867-453e-9763-a9fbf603c6ff',
          build: {
            id: 'f50e37ee-6867-453e-9763-a9fbf603c6ff',
            number: 6,
            branch: 'basset-io-test',
            commitSha: '969fdec99723c502a045c66624f44dbb3a8c3f24',
            commitMessage:
              'feat(platform): enable redirect on login / oauth (#15)\r\n\r\n* enable redirect on login / oauth\r\n\r\n* add test\r\n',
            committerName: 'GitHub',
            committerEmail: 'noreply@github.com',
            commitDate: '1562338606000',
            authorName: 'Basset User',
            authorDate: '1562338606000',
            authorEmail: 'basset@basset.io',
            createdAt: '1562392472557',
            updatedAt: '1562393001343',
            completedAt: '1562392487669',
            submittedAt: '1562392472827',
            cancelledAt: null,
            __typename: 'Build',
          },
          projectId: 'c671ae78-1ce4-4f2b-b696-1553201053e9',
          organizationId: 'c7986a42-c688-465d-9326-c0fc02d58eed',
          approvedBy: {
            user: {
              id: '9169b595-213f-4f19-beff-3f507f2ba6c2',
              name: 'Basset User',
              __typename: 'User',
            },
            __typename: 'OrganizationMember',
          },
          __typename: 'Snapshot',
        },
        __typename: 'SnapshotEdge',
      },
      {
        cursor:
          'MTU2MjM5MjQyMzU1OA==:NDRlNTk3Y2EtNDk4MC00NTNjLWI0M2QtM2FjNjQ4MzliODI3',
        node: {
          id: '44e597ca-4980-453c-b43d-3ac64839b827',
          imageLocation:
            'http://192.168.39.61:30462/screenshots.basset.io/c7986a42-c688-465d-9326-c0fc02d58eed/c671ae78-1ce4-4f2b-b696-1553201053e9/a59d6c02-ab29-4dbf-a2d7-b144181340bb/screenshots/firefox/1280/7d4617aa89804785bccc076b1479cde0.html.png',
          approved: true,
          approvedOn: '1562392467408',
          title: 'index',
          width: 1280,
          browser: 'firefox',
          diff: true,
          buildId: 'a59d6c02-ab29-4dbf-a2d7-b144181340bb',
          build: {
            id: 'a59d6c02-ab29-4dbf-a2d7-b144181340bb',
            number: 5,
            branch: 'basset-io-test',
            commitSha: '969fdec99723c502a045c66624f44dbb3a8c3f24',
            commitMessage:
              'feat(platform): enable redirect on login / oauth (#15)\n\n* enable redirect on login / oauth\r\n\r\n* add test\r\n',
            committerName: 'GitHub',
            committerEmail: 'noreply@github.com',
            commitDate: '1562338606000',
            authorName: 'Basset User',
            authorDate: '1562338606000',
            authorEmail: 'basset@basset.io',
            createdAt: '1562392423293',
            updatedAt: '1562392441244',
            completedAt: '1562392441244',
            submittedAt: '1562392423571',
            cancelledAt: null,
            __typename: 'Build',
          },
          projectId: 'c671ae78-1ce4-4f2b-b696-1553201053e9',
          organizationId: 'c7986a42-c688-465d-9326-c0fc02d58eed',
          approvedBy: {
            user: {
              id: '9169b595-213f-4f19-beff-3f507f2ba6c2',
              name: 'Basset User',
              __typename: 'User',
            },
            __typename: 'OrganizationMember',
          },
          __typename: 'Snapshot',
        },
        __typename: 'SnapshotEdge',
      },
      {
        cursor:
          'MTU2MjM5MjQwOTMzMg==:NTRlOTE0ZDUtZTcwNi00NjMxLTliNTQtMGQzYzZlMTY5ODVj',
        node: {
          id: '54e914d5-e706-4631-9b54-0d3c6e16985c',
          imageLocation:
            'http://192.168.39.61:30462/screenshots.basset.io/c7986a42-c688-465d-9326-c0fc02d58eed/c671ae78-1ce4-4f2b-b696-1553201053e9/80b21a8e-54d8-4070-8503-f68c19170726/screenshots/firefox/1280/68b71181f57845ca893baf1a4dbea010.html.png',
          approved: true,
          approvedOn: '1562392417262',
          title: 'index',
          width: 1280,
          browser: 'firefox',
          diff: true,
          buildId: '80b21a8e-54d8-4070-8503-f68c19170726',
          build: {
            id: '80b21a8e-54d8-4070-8503-f68c19170726',
            number: 4,
            branch: 'basset-io-test',
            commitSha: '969fdec99723c502a045c66624f44dbb3a8c3f24',
            commitMessage:
              'feat(platform): enable redirect on login / oauth (#15)\n\n* enable redirect on login / oauth\r\n\r\n* add test\r\n',
            committerName: 'GitHub',
            committerEmail: 'noreply@github.com',
            commitDate: '1562338606000',
            authorName: 'Basset User',
            authorDate: '1562338606000',
            authorEmail: 'basset@basset.io',
            createdAt: '1562392408929',
            updatedAt: '1562392410542',
            completedAt: '1562392410542',
            submittedAt: '1562392409364',
            cancelledAt: null,
            __typename: 'Build',
          },
          projectId: 'c671ae78-1ce4-4f2b-b696-1553201053e9',
          organizationId: 'c7986a42-c688-465d-9326-c0fc02d58eed',
          approvedBy: {
            user: {
              id: '9169b595-213f-4f19-beff-3f507f2ba6c2',
              name: 'Basset User',
              __typename: 'User',
            },
            __typename: 'OrganizationMember',
          },
          __typename: 'Snapshot',
        },
        __typename: 'SnapshotEdge',
      },
      {
        cursor:
          'MTU2MjM5MjM3NTMwMg==:NDYyMzVkYWEtZDFkNC00MzA4LTgyYWItMGM0ZmQyMjc0MmJi',
        node: {
          id: '46235daa-d1d4-4308-82ab-0c4fd22742bb',
          imageLocation:
            'http://192.168.39.61:30462/screenshots.basset.io/c7986a42-c688-465d-9326-c0fc02d58eed/c671ae78-1ce4-4f2b-b696-1553201053e9/bc5cf6d3-0551-4b2c-94cd-a9c7bdd2d59e/screenshots/firefox/1280/1d481c662ad34732a670bfc9d05ca665.html.png',
          approved: true,
          approvedOn: '1562450819196',
          title: 'index',
          width: 1280,
          browser: 'firefox',
          diff: true,
          buildId: 'bc5cf6d3-0551-4b2c-94cd-a9c7bdd2d59e',
          build: {
            id: 'bc5cf6d3-0551-4b2c-94cd-a9c7bdd2d59e',
            number: 3,
            branch: 'basset-io-test',
            commitSha: '969fdec99723c502a045c66624f44dbb3a8c3f24',
            commitMessage:
              'feat(platform): enable redirect on login / oauth (#15)\n\n* enable redirect on login / oauth\r\n\r\n* add test\r\n',
            committerName: 'GitHub',
            committerEmail: 'noreply@github.com',
            commitDate: '1562338606000',
            authorName: 'Basset User',
            authorDate: '1562338606000',
            authorEmail: 'basset@basset.io',
            createdAt: '1562392375016',
            updatedAt: '1562450819246',
            completedAt: '1562392376411',
            submittedAt: '1562392375314',
            cancelledAt: null,
            __typename: 'Build',
          },
          projectId: 'c671ae78-1ce4-4f2b-b696-1553201053e9',
          organizationId: 'c7986a42-c688-465d-9326-c0fc02d58eed',
          approvedBy: {
            user: {
              id: '9169b595-213f-4f19-beff-3f507f2ba6c2',
              name: 'Basset User',
              __typename: 'User',
            },
            __typename: 'OrganizationMember',
          },
          __typename: 'Snapshot',
        },
        __typename: 'SnapshotEdge',
      },
    ];
    store.dispatch(
      snapshotActions.receiveSnapshots(
        'history',
        snapshotData.map(e => e.node),
      ),
    );
    store.dispatch(snapshotActions.doneLoading('history'));
  });
  test('loader', () => {
    store.dispatch(snapshotActions.isLoading('history'));
    const { getByTestId } = renderApp(<SnapshotHistory />);
    getByTestId('loader');
  });
  test('next button', () => {
    const { getByTestId } = renderApp(<SnapshotHistory />);
    const image = getByTestId('snapshot-image');
    const next = getByTestId('next-snapshot');
    expect(image.getAttribute('src')).toBe(`/screenshots/${snapshotData[0].node.id}`);
    next.click();
    expect(image.getAttribute('src')).toBe(`/screenshots/${snapshotData[1].node.id}`);
    next.click();
    expect(image.getAttribute('src')).toBe(`/screenshots/${snapshotData[2].node.id}`);
    next.click();
    expect(image.getAttribute('src')).toBe(`/screenshots/${snapshotData[3].node.id}`);
    next.click();
    expect(image.getAttribute('src')).toBe(`/screenshots/${snapshotData[0].node.id}`);
  });

  test('prev button', () => {
    const { getByTestId } = renderApp(<SnapshotHistory />);
    const image = getByTestId('snapshot-image');
    const prev = getByTestId('prev-snapshot');
    expect(image.getAttribute('src')).toBe(`/screenshots/${snapshotData[0].node.id}`);
    prev.click();
    expect(image.getAttribute('src')).toBe(`/screenshots/${snapshotData[3].node.id}`);
    prev.click();
    expect(image.getAttribute('src')).toBe(`/screenshots/${snapshotData[2].node.id}`);
    prev.click();
    expect(image.getAttribute('src')).toBe(`/screenshots/${snapshotData[1].node.id}`);
  });

  test('show change over time', async () => {
    let { getByTestId } = renderApp(<SnapshotHistory />);
    let image = getByTestId('snapshot-image');
    const slideshow = getByTestId('snapshot-slideshow');
    slideshow.click();
    expect(image.getAttribute('src')).toBe(`/screenshots/${snapshotData[0].node.id}`);
    act(() => {
      jest.advanceTimersByTime('2000');
    });
    image = getByTestId('snapshot-image');
    expect(image.getAttribute('src')).toBe(`/screenshots/${snapshotData[1].node.id}`);
  });
});

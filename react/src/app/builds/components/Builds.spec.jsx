import React from 'react';
import { cleanup } from 'react-testing-library';

import { store, renderApp } from '../../../tests/render-redux.js';
import * as organizationActions from '../../../redux/organizations/actions.js';
import * as projectActions from '../../../redux/projects/actions.js';
import * as buildActions from '../../../redux/builds/actions.js';
import Builds from './Builds.jsx';

afterEach(cleanup);

describe('<Builds />', () => {
  beforeEach(() => {
    store.dispatch(
      organizationActions.receiveOrganizations([
        {
          id: '1234',
          name: 'organization',
        },
      ]),
    );
    store.dispatch(
      projectActions.receiveProjects([
        {
          id: '1234',
          name: 'project',
        },
      ]),
    );
    store.dispatch(
      buildActions.receiveBuilds([
        {
          id: 'f8d6cf3e-cb4d-4421-bde6-0fc79451fdf5',
          number: 47,
          branch: 'asset-and-snapshot-caching',
          commitSha: '8f860602a1bc8ed2869b9599ea9589051188286e',
          commitMessage: 'rename assets using sha as filename\n',
          committerName: 'tester',
          comitterEmail: null,
          commitDate: '1556605524000',
          authorName: 'tester',
          authorEmail: 'tester@basset.io',
          createdAt: '1556645191023',
          updatedAt: '1556645194099',
          completedAt: '1556645194099',
          submittedAt: '1556645191534',
          cancelledAt: null,
          totalSnapshots: 6,
          approvedSnapshots: 0,
          modifiedSnapshots: 0,
          newSnapshots: 0,
          removedSnapshots: 0,
        },
        {
          id: 'a0938660-5408-41e3-b95e-f4c5e4866fb5',
          number: 46,
          branch: 'asset-and-snapshot-caching',
          commitSha: '8f860602a1bc8ed2869b9599ea9589051188286e',
          commitMessage: 'rename assets using sha as filename\n',
          committerName: 'tester',
          comitterEmail: null,
          commitDate: '1556605524000',
          authorName: 'tester',
          authorEmail: 'tester@basset.io',
          createdAt: '1556644725467',
          updatedAt: '1556644730225',
          completedAt: '1556644730225',
          submittedAt: '1556644725928',
          cancelledAt: null,
          totalSnapshots: 6,
          approvedSnapshots: 0,
          modifiedSnapshots: 0,
          newSnapshots: 0,
          removedSnapshots: 0,
        },
        {
          id: '34b7636f-41d5-4bdc-9833-600e96d6d836',
          number: 45,
          branch: 'asset-and-snapshot-caching',
          commitSha: '8f860602a1bc8ed2869b9599ea9589051188286e',
          commitMessage: 'rename assets using sha as filename\n',
          committerName: 'tester',
          comitterEmail: null,
          commitDate: '1556605524000',
          authorName: 'tester',
          authorEmail: 'tester@basset.io',
          createdAt: '1556644643464',
          updatedAt: '1556769629746',
          completedAt: '1556769629746',
          submittedAt: '1556644644011',
          cancelledAt: null,
          totalSnapshots: 6,
          approvedSnapshots: 0,
          modifiedSnapshots: 0,
          newSnapshots: 0,
          removedSnapshots: 0,
        },
        {
          id: 'c6d32599-f6ce-4e9f-8565-50ae2b2ebfe6',
          number: 44,
          branch: 'asset-and-snapshot-caching',
          commitSha: '8f860602a1bc8ed2869b9599ea9589051188286e',
          commitMessage: 'rename assets using sha as filename\n',
          committerName: 'tester',
          comitterEmail: null,
          commitDate: '1556605524000',
          authorName: 'tester',
          authorEmail: 'tester@basset.io',
          createdAt: '1556644610319',
          updatedAt: '1556644613316',
          completedAt: '1556644613316',
          submittedAt: '1556644610854',
          cancelledAt: null,
          totalSnapshots: 6,
          approvedSnapshots: 0,
          modifiedSnapshots: 0,
          newSnapshots: 0,
          removedSnapshots: 0,
        },
        {
          id: '474a050a-1479-4c21-aadb-e704ff47b53d',
          number: 43,
          branch: 'asset-and-snapshot-caching',
          commitSha: '8f860602a1bc8ed2869b9599ea9589051188286e',
          commitMessage: 'rename assets using sha as filename\n',
          committerName: 'tester',
          comitterEmail: null,
          commitDate: '1556605524000',
          authorName: 'tester',
          authorEmail: 'tester@basset.io',
          createdAt: '1556644130349',
          updatedAt: '1556644481870',
          completedAt: '1556644481870',
          submittedAt: '1556644130813',
          cancelledAt: null,
          totalSnapshots: 6,
          approvedSnapshots: 0,
          modifiedSnapshots: 0,
          newSnapshots: 6,
          removedSnapshots: 0,
        },
      ]),
    );
    store.dispatch(projectActions.setCurrentProject('1234'));
    store.dispatch(buildActions.setCurrentBuild('1234'));
    store.dispatch(organizationActions.doneLoading());
    store.dispatch(buildActions.doneLoading());
    store.dispatch(projectActions.doneLoading());
  });
  test('no builds', () => {
    store.dispatch(buildActions.receiveBuilds([]));
    const { queryByTestId } = renderApp(<Builds />);
    expect(queryByTestId('loader')).toBeNull();
    expect(queryByTestId('load-more')).toBeNull();
    expect(queryByTestId('no-builds')).not.toBeNull();
  });
  test('load more button', () => {
    buildActions.loadMore = jest.fn(() => (dispatch, getState) => {});
    store.dispatch(
      buildActions.updatePageInfo({
        pageInfo: {
          hasNextPage: true,
        },
        edges: [],
      }),
    );
    const { getByTestId } = renderApp(<Builds />);
    const loadMoreButton = getByTestId('load-more');
    loadMoreButton.click();
    expect(buildActions.loadMore).toHaveBeenCalled();
  });
});

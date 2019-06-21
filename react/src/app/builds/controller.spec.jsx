import React from 'react';
import { cleanup, fireEvent, waitForElement } from 'react-testing-library';

import { store, renderWithRedux } from '../../tests/render-redux.js';
import * as organizationActions from '../../redux/organizations/actions.js';
import * as projectActions from '../../redux/projects/actions.js';
import * as buildActions from '../../redux/builds/actions.js';
import Build from './controller.jsx';

let mockQuery = Promise.resolve();
jest.mock('../../graphql/client.js', () => {
  return {
    query: jest.fn(() => mockQuery),
  };
});

import ApolloClient from '../../graphql/client.js';

afterEach(cleanup);

describe('<BuildController />', () => {
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
          id: '1234',
          branch: 'build',
        },
      ]),
    );
    store.dispatch(projectActions.setCurrentProject('1234'));
    store.dispatch(buildActions.setCurrentBuild('1234'));
    store.dispatch(organizationActions.doneLoading());
    store.dispatch(buildActions.doneLoading());
    store.dispatch(projectActions.doneLoading());
  });
  test('show loader', async () => {
    store.dispatch(buildActions.isLoading());
    const { queryByTestId } = renderWithRedux(<Build />);
    expect(queryByTestId('loader')).not.toBeNull();
  });
  test('no build returns null', () => {
    store.dispatch(buildActions.setCurrentBuild(''));
    const { queryByTestId } = renderWithRedux(<Build />);
    expect(queryByTestId('loader')).toBeNull();
  });
  test('search for snapshot', async () => {
    mockQuery = Promise.resolve({
      data: {
        snapshots: {
          edges: [
            {
              node: {
                id: 1,
                title: 'test',
              },
            },
            {
              node: {
                id: 2,
                title: 'test2',
              },
            },
          ],
        },
      },
    });
    const { queryByText, getByTestId } = renderWithRedux(<Build />);

    const search = getByTestId('search-input');
    fireEvent.change(search, { target: { value: 'test' } });
    fireEvent.submit(search);
    expect(ApolloClient.query).toHaveBeenCalledTimes(1);
    await waitForElement(() => queryByText('Found snapshots'));
    expect(queryByText('(2)')).not.toBeNull();
    const clearResults = getByTestId('clear-results');
    fireEvent.click(clearResults);
    expect(queryByText('Found snapshots')).toBeNull();
  });
});

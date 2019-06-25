import React from 'react';
import {
  fireEvent,
  cleanup,
  waitForElement,
  getByText,
  wait,
  queryByTestId,
} from 'react-testing-library';
import { store, renderWithRedux } from '../../../tests/render-redux.js';

import * as organizationActions from '../../../redux/organizations/actions.js';
import * as projectActions from '../../../redux/projects/actions.js';
import * as userActions from '../../../redux/user/actions.js';
import * as routerActions from '../../../redux/router/actions.js';

let mockMutate = Promise.resolve();

jest.mock('../../../graphql/client.js', () => {
  return {
    query: jest.fn(() => Promise.resolve()),
    mutate: jest.fn(() => mockMutate),
  };
});

import ApolloClient from '../../../graphql/client.js';

import CreateProject from './controller.jsx';

afterEach(cleanup);

describe('<CreateProject />', () => {
  beforeEach(() => {
    store.dispatch(
      userActions.receiveUser({
        name: '',
        canCreateOrganizations: true,
        providers: {
          edges: [],
        },
      }),
    );
    store.dispatch(
      organizationActions.receiveOrganizations([
        {
          id: '1234',
          name: 'organization',
          admin: true,
        },
      ]),
    );
    store.dispatch(organizationActions.doneLoading());
    projectActions.addProject = jest.fn(() => (dispatch, getState) => {});
    routerActions.goHome = jest.fn(() => (dispatch, getState) => {});
  });
  test('create project', async () => {
    mockMutate = Promise.resolve({
      data: {
        createProject: {
          project: {},
        },
      },
    });
    const { getByTestId } = renderWithRedux(<CreateProject />);

    const input = getByTestId('create-project-name-input');
    fireEvent.change(input, {
      target: {
        value: 'basset',
      },
    });
    fireEvent.submit(input);
    expect(ApolloClient.mutate).toHaveBeenCalled();
    await wait(() => expect(projectActions.addProject).toHaveBeenCalled());
    await wait(() => expect(routerActions.goHome).toHaveBeenCalled());
  });
  test('name is required', async () => {
    mockMutate = Promise.resolve({
      data: {
        createProject: {
          project: {},
        },
      },
    });
    const { container, getByTestId } = renderWithRedux(<CreateProject />);

    const input = getByTestId('create-project-name-input');
    fireEvent.submit(input);
    expect(ApolloClient.mutate).not.toHaveBeenCalled();

    await waitForElement(
      () => getByText(container, 'You must enter a name.'),
      container,
    );
  });
  test('graphql error', async () => {
    mockMutate = Promise.reject({
      data: {
        createProject: false,
      },
      graphQLErrors: [
        {
          message: 'it broken',
        },
      ],
    });
    const { container, getByTestId } = renderWithRedux(<CreateProject />);

    const input = getByTestId('create-project-name-input');
    fireEvent.change(input, {
      target: {
        value: 'basset',
      },
    });
    fireEvent.submit(input);

    expect(ApolloClient.mutate).toHaveBeenCalled();

    await waitForElement(() => getByText(container, 'it broken'));
  });
  test('request error', async () => {
    mockMutate = Promise.reject({
      data: {
        createProject: false,
      },
    });
    const { container, getByTestId } = renderWithRedux(<CreateProject />);

    const input = getByTestId('create-project-name-input');
    fireEvent.change(input, {
      target: {
        value: 'basset',
      },
    });
    fireEvent.submit(input);

    expect(ApolloClient.mutate).toHaveBeenCalled();

    await waitForElement(() => queryByTestId(document, 'notification'));
  });
});

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
import * as routerActions from '../../../redux/router/actions.js';

let mockMutate = Promise.resolve();

jest.mock('../../../graphql/client.js', () => {
  return {
    query: jest.fn(() => Promise.resolve()),
    mutate: jest.fn(() => mockMutate),
  };
});

import ApolloClient from '../../../graphql/client.js';

import CreateOrganization from './controller.jsx';

afterEach(cleanup);

describe('<CreateOrganization />', () => {
  beforeEach(() => {
    organizationActions.addOrganization = jest.fn(
      () => (dispatch, getState) => {},
    );
    routerActions.goHome = jest.fn(() => (dispatch, getState) => {});
  });
  test('create organization', async () => {
    mockMutate = Promise.resolve({
      data: {
        createOrganization: {
          organization: {},
        },
      },
    });
    const { getByTestId } = renderWithRedux(<CreateOrganization />);

    const input = getByTestId('create-organization-name-input');
    fireEvent.change(input, {
      target: {
        value: 'basset',
      },
    });
    fireEvent.submit(input);
    expect(ApolloClient.mutate).toHaveBeenCalled();
    await wait(() =>
      expect(organizationActions.addOrganization).toHaveBeenCalled(),
    );
    await wait(() => expect(routerActions.goHome).toHaveBeenCalled());
  });
  test('name is required', async () => {
    mockMutate = Promise.resolve({
      data: {
        createOrganization: {
          organization: {},
        },
      },
    });
    const { container, getByTestId } = renderWithRedux(<CreateOrganization />);

    const input = getByTestId('create-organization-name-input');
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
        createOrganization: false,
      },
      graphQLErrors: [
        {
          message: 'it broken',
        },
      ],
    });
    const { container, getByTestId } = renderWithRedux(<CreateOrganization />);

    const input = getByTestId('create-organization-name-input');
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
        createOrganization: false,
      },
    });
    const { container, getByTestId } = renderWithRedux(<CreateOrganization />);

    const input = getByTestId('create-organization-name-input');
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

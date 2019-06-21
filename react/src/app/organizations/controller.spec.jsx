import React from 'react';
import {
  fireEvent,
  cleanup,
  waitForElement,
  wait,
} from 'react-testing-library';
import { store, renderWithRedux } from '../../tests/render-redux.js';

import * as organizationActions from '../../redux/organizations/actions.js';
import * as userActions from '../../redux/user/actions.js';

import Organization from './controller.jsx';

let mockMutate = Promise.resolve();
let mockMembersQuery = Promise.resolve({
  data: {
    organizationMembers: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
      },
    },
  },
});

jest.mock('../../graphql/client.js', () => {
  return {
    query: jest.fn(request => {
      if (request.query.definitions[0].name.value === 'members') {
        return mockMembersQuery;
      }
      return Promise.resolve();
    }),
    mutate: jest.fn(() => mockMutate),
  };
});

import ApolloClient from '../../graphql/client.js';

afterEach(cleanup);

describe('<Organization />', () => {
  beforeEach(() => {
    organizationActions.saveOrganization = jest.fn(
      () => (dispatch, getState) => {},
    );
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
  });
  test('only admins can edit', async () => {
    store.dispatch(
      organizationActions.receiveOrganizations([
        {
          id: '1234',
          name: 'organization',
          admin: false,
        },
      ]),
    );
    const { queryByTestId, getByText } = renderWithRedux(<Organization />);
    expect(queryByTestId('edit-organization-name')).toBeNull();
    getByText('Only admins can edit these settings.');
  });
  test('update organization', async () => {
    const { getByTestId } = renderWithRedux(<Organization />);
    const editBtn = getByTestId('edit-organization-name');
    editBtn.click();
    const input = getByTestId('organization-name-input');
    fireEvent.change(input, {
      target: {
        value: 'basset',
      },
    });
    fireEvent.submit(input);
    expect(organizationActions.saveOrganization).toHaveBeenCalled();
  });
  test('creating organizations is allowed', async () => {
    const { queryByTestId } = renderWithRedux(<Organization />);
    expect(queryByTestId('create-organization')).not.toBeNull();
  });
  test('creating organizations is disabled', async () => {
    store.dispatch(
      userActions.receiveUser({
        name: '',
        canCreateOrganizations: false,
        providers: {
          edges: [],
        },
      }),
    );
    const { queryByTestId } = renderWithRedux(<Organization />);
    expect(queryByTestId('create-organization')).toBeNull();
  });
});

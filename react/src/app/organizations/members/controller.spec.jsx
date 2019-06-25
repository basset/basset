import React from 'react';
import {
  fireEvent,
  cleanup,
  getByTestId as _getByTestId,
  getByText as _getByText,
  waitForDomChange,
  waitForElement,
} from 'react-testing-library';
import { store, renderWithRedux } from '../../../tests/render-redux.js';

import * as organizationActions from '../../../redux/organizations/actions.js';
import * as userActions from '../../../redux/user/actions.js';

import OrganizationTabs from './controller.jsx';

let mockMutate = Promise.resolve();
let mockInvitesQuery = Promise.resolve({
  data: {
    invites: {
      edges: [
        {
          node: {
            id: '1',
            fromMember: {
              user: {
                id: '1',
              },
            },
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
      },
    },
  },
});
let mockMembersQuery = Promise.resolve({
  data: {
    organizationMembers: {
      edges: [
        {
          node: {
            id: '1',
            admin: true,
            active: true,
            user: {
              id: '1',
              name: 'billy bobby',
              email: 'billybob@basset.io',
            },
          },
        },
        {
          node: {
            id: '2',
            admin: false,
            active: true,
            user: {
              id: '2',
              name: 'tester mctester',
              email: 'mctester@basset.io',
            },
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
      },
    },
  },
});

jest.mock('../../../graphql/client.js', () => {
  return {
    query: jest.fn(request => {
      if (request.query.definitions[0].name.value === 'members') {
        return mockMembersQuery;
      }
      if (request.query.definitions[0].name.value === 'invites') {
        return mockInvitesQuery;
      }
      return Promise.resolve();
    }),
    mutate: jest.fn(() => mockMutate),
  };
});

import ApolloClient from '../../../graphql/client.js';

afterEach(cleanup);

describe('<Organization />', () => {
  beforeEach(() => {
    store.dispatch(
      userActions.receiveUser({
        id: '1',
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
    window.scrollTo = jest.fn();
    ApolloClient.mutate = jest.fn(() => mockMutate);
  });
  afterEach(cleanup);

  test('invite new member', async () => {
    mockMutate = Promise.resolve({
      data: {
        createInvite: {},
      },
    });
    const { getByTestId } = renderWithRedux(<OrganizationTabs />);
    const inviteButton = getByTestId('invite-member');
    inviteButton.click();
    const cancel = _getByTestId(document, 'cancel-invite-member');
    cancel.click();
    inviteButton.click();
    const emailInput = _getByTestId(document, 'invite-email-input');
    fireEvent.change(emailInput, {
      target: {
        value: 'newuser@basset.io',
      },
    });
    const confirm = _getByTestId(document, 'confirm-invite-member');
    confirm.click();

    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
  });
  test('error inviting new member', async () => {
    mockMutate = Promise.reject({
      graphQLErrors: [
        {
          message:
            'This email address belongs to a user already in this organization.',
        },
      ],
    });
    const { getByTestId } = renderWithRedux(<OrganizationTabs />);
    const inviteButton = getByTestId('invite-member');
    inviteButton.click();
    const emailInput = _getByTestId(document, 'invite-email-input');
    fireEvent.change(emailInput, {
      target: {
        value: 'newuser@basset.io',
      },
    });
    const confirm = _getByTestId(document, 'confirm-invite-member');
    confirm.click();
    await waitForDomChange();
    _getByText(
      document,
      'This email address belongs to a user already in this organization.',
    );
    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
  });
  test('request error inviting new member', async () => {
    mockMutate = Promise.reject({
      error: {},
    });
    const { getByTestId } = renderWithRedux(<OrganizationTabs />);
    const inviteButton = getByTestId('invite-member');
    inviteButton.click();
    const emailInput = _getByTestId(document, 'invite-email-input');
    fireEvent.change(emailInput, {
      target: {
        value: 'newuser@basset.io',
      },
    });
    const confirm = _getByTestId(document, 'confirm-invite-member');
    confirm.click();
    await waitForDomChange();
    _getByTestId(document, 'notification');
    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
  });
  test('after invite query is called again', async () => {
    mockMutate = Promise.resolve({
      data: {
        createInvite: {},
      },
    });
    const { getByTestId } = renderWithRedux(<OrganizationTabs />);
    await waitForDomChange();
    const invitesTab = getByTestId('invites');
    invitesTab.click();
    expect(ApolloClient.query).toHaveBeenCalledTimes(2);
    const inviteButton = getByTestId('invite-member');
    inviteButton.click();
    const emailInput = _getByTestId(document, 'invite-email-input');
    fireEvent.change(emailInput, {
      target: {
        value: 'newuser2@basset.io',
      },
    });
    const confirm = _getByTestId(document, 'confirm-invite-member');
    confirm.click();
    await waitForDomChange();

    expect(ApolloClient.query).toHaveBeenCalledTimes(3);
  });

  test('leave organization', async () => {
    mockMutate = Promise.resolve({
      data: {
        removeMember: true,
      },
    });
    organizationActions.leaveCurrentOrganization = jest.fn(
      () => (dispatch, getState) => {},
    );

    const { getAllByTestId, getByTestId, queryByTestId } = renderWithRedux(
      <OrganizationTabs />,
    );
    await waitForElement(() => getByTestId('member-dropdown'));
    const userMenu = getAllByTestId('member-dropdown')[0];
    userMenu.click();
    await waitForDomChange();
    getByTestId('leave-organization').click();
    await waitForDomChange();
    _getByTestId(document, 'cancel-remove-member').click();
    expect(ApolloClient.mutate).not.toHaveBeenCalled();
    userMenu.click();
    getByTestId('leave-organization').click();
    await waitForDomChange();
    _getByTestId(document, 'confirm-remove-member').click();
    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
    await waitForDomChange();
    expect(getAllByTestId('member-dropdown')).toHaveLength(1);
    expect(organizationActions.leaveCurrentOrganization).toHaveBeenCalledTimes(
      1,
    );
  });
  test('no menu for non admin', async () => {
    store.dispatch(
      userActions.receiveUser({
        id: '100',
        name: '',
        email: 'testereest@basset.io',
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
          admin: false,
        },
      ]),
    );
    const { getByText, queryByTestId } = renderWithRedux(<OrganizationTabs />);
    await waitForElement(() => getByText('billybob@basset.io'));
    expect(queryByTestId('member-dropdown')).toBeNull();
  });
  test('remove member', async () => {
    mockMutate = Promise.resolve({
      data: {
        removeMember: true,
      },
    });

    const { getByTestId, getAllByTestId, queryByTestId } = renderWithRedux(
      <OrganizationTabs />,
    );
    await waitForElement(() => getByTestId('member-dropdown'));
    const userMenu = getAllByTestId('member-dropdown')[1];
    userMenu.click();
    await waitForDomChange();
    getByTestId('remove-member').click();
    await waitForDomChange();
    _getByTestId(document, 'cancel-remove-member').click();
    expect(ApolloClient.mutate).not.toHaveBeenCalled();
    userMenu.click();
    getByTestId('remove-member').click();
    await waitForDomChange();
    _getByTestId(document, 'confirm-remove-member').click();
    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
    await waitForDomChange();
    expect(getAllByTestId('member-dropdown')).toHaveLength(1);
  });

  test('error removing member', async () => {
    ApolloClient.mutate = jest.fn(() =>
      Promise.reject({
        graphQLErrors: [{ message: 'uhoh' }],
      }),
    );
    const { getByTestId, getAllByTestId } = renderWithRedux(
      <OrganizationTabs />,
    );
    await waitForElement(() => getByTestId('member-dropdown'));
    const userMenu = getAllByTestId('member-dropdown')[1];
    userMenu.click();
    await waitForDomChange();
    getByTestId('remove-member').click();
    await waitForDomChange();
    _getByTestId(document, 'confirm-remove-member').click();
    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
    await waitForDomChange();
    _getByTestId(document, 'notification');
    expect(getAllByTestId('member-dropdown')).toHaveLength(2);
  });

  test('toggle admin', async () => {
    mockMutate = Promise.resolve({
      data: {
        updateMember: {
          id: '2',
          admin: true,
        },
      },
    });
    const {
      queryAllByLabelText,
      getByTestId,
      getAllByTestId,
    } = renderWithRedux(<OrganizationTabs />);
    await waitForElement(() => getByTestId('member-dropdown'));
    const userMenu = getAllByTestId('member-dropdown')[1];
    expect(queryAllByLabelText('StatusGood')).toHaveLength(1);
    userMenu.click();
    await waitForDomChange();
    getByTestId('toggle-admin').click();
    await waitForDomChange();
    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
    expect(queryAllByLabelText('StatusGood')).toHaveLength(2);
  });

  test('error toggling admin', async () => {
    ApolloClient.mutate = jest.fn(() =>
      Promise.reject({
        graphQLErrors: [{ message: 'uhoh' }],
      }),
    );
    const {
      queryAllByLabelText,
      getByTestId,
      getAllByTestId,
    } = renderWithRedux(<OrganizationTabs />);
    await waitForElement(() => getByTestId('member-dropdown'));
    const userMenu = getAllByTestId('member-dropdown')[1];
    expect(queryAllByLabelText('StatusGood')).toHaveLength(1);
    userMenu.click();
    await waitForDomChange();
    getByTestId('toggle-admin').click();
    await waitForDomChange();
    _getByTestId(document, 'notification');
    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
    expect(queryAllByLabelText('StatusGood')).toHaveLength(1);
  });

  test('toggle inactive', async () => {
    mockMutate = Promise.resolve({
      data: {
        updateMember: {
          id: '2',
          active: false,
        },
      },
    });
    const { queryAllByText, getByTestId, getAllByTestId } = renderWithRedux(
      <OrganizationTabs />,
    );
    await waitForElement(() => getByTestId('member-dropdown'));
    const userMenu = getAllByTestId('member-dropdown')[1];
    expect(queryAllByText('Active')).toHaveLength(2);
    userMenu.click();
    await waitForDomChange();
    getByTestId('toggle-active').click();
    await waitForDomChange();
    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
    expect(queryAllByText('Active')).toHaveLength(1);
    expect(queryAllByText('Inactive')).toHaveLength(1);
  });

  test('error toggling inactive', async () => {
    ApolloClient.mutate = jest.fn(() =>
      Promise.reject({
        graphQLErrors: [{ message: 'uhoh' }],
      }),
    );
    const { queryAllByText, getByTestId, getAllByTestId } = renderWithRedux(
      <OrganizationTabs />,
    );
    await waitForElement(() => getByTestId('member-dropdown'));
    const userMenu = getAllByTestId('member-dropdown')[1];
    expect(queryAllByText('Active')).toHaveLength(2);
    userMenu.click();
    await waitForDomChange();
    getByTestId('toggle-active').click();
    await waitForDomChange();
    _getByTestId(document, 'notification');
    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
    expect(queryAllByText('Active')).toHaveLength(2);
  });
});

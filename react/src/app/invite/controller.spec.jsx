import React from 'react';
import {
  fireEvent,
  cleanup,
  waitForElement,
  getByTestId,
  getByText,
  waitForDomChange,
} from 'react-testing-library';
import { store, renderWithRedux } from '../../tests/render-redux.js';

import * as userActions from '../../redux/user/actions.js';

let mockMutate = Promise.resolve();
let mockQuery = Promise.resolve();
jest.mock('../../graphql/client.js', () => {
  return {
    query: jest.fn(() => mockQuery),
    mutate: jest.fn(() => mockMutate),
  };
});
import ApolloClient from '../../graphql/client.js';

import Invite from './controller.jsx';

afterEach(cleanup);

describe('<Invite />', () => {
  let PROPS;
  beforeEach(() => {
    global.window.__BASSET__ = {
      logins: {
        github: true,
      },
    };
    userActions.login = jest.fn(() => (dispatch, getState) => {});
    PROPS = {
      id: 'id',
      token: 'token',
      isAuthenticated: true,
      user: {
        email: 'tester@basset.io',
      },
    };
  });
  test('invite is valid for logged in user', async () => {
    mockQuery = Promise.resolve({
      data: {
        validateInvite: {
          email: 'tester@basset.io',
          fromMember: {
            user: {
              name: 'tester friend',
            },
          },
          organization: {
            name: 'tests',
          },
        },
      },
    });
    mockMutate = Promise.resolve({
      data: {
        acceptInvite: {
          user: {},
        },
      },
    });
    const { container, queryByTestId } = renderWithRedux(<Invite {...PROPS} />);
    expect(queryByTestId('loader')).not.toBeNull();
    expect(ApolloClient.query).toHaveBeenCalled();

    await waitForElement(() => getByTestId(container, 'invite-join'));

    const joinButton = getByTestId(container, 'invite-join');
    joinButton.click();

    expect(ApolloClient.mutate).toHaveBeenCalled();

    await waitForElement(
      () => getByTestId(container, 'invite-done'),
      container,
    );
  });
  test('invite valid for non authenticated user', async () => {
    mockQuery = Promise.resolve({
      data: {
        validateInvite: {
          email: 'tester@basset.io',
          fromMember: {
            user: {
              name: 'tester friend',
            },
          },
          organization: {
            name: 'tests',
          },
        },
      },
    });
    PROPS.isAuthenticated = false;
    const { container, queryByTestId } = renderWithRedux(<Invite {...PROPS} />);
    expect(queryByTestId('loader')).not.toBeNull();
    expect(ApolloClient.query).toHaveBeenCalled();

    await waitForElement(() =>
      getByText(container, 'You must create an account or login first'),
    );
  });
  test('can you sign up for an account', async () => {
    mockQuery = Promise.resolve({
      data: {
        validateInvite: {
          email: 'tester@basset.io',
          fromMember: {
            user: {
              name: 'tester friend',
            },
          },
          organization: {
            name: 'tests',
          },
        },
      },
    });
    PROPS.isAuthenticated = false;

    const { container, queryByTestId } = renderWithRedux(<Invite {...PROPS} />);
    const loader = queryByTestId('loader');
    expect(loader).not.toBeNull();
    await waitForDomChange();
    expect(ApolloClient.query).toHaveBeenCalled();

    expect(queryByTestId('test-github')).not.toBeNull();

    const emailInput = getByTestId(container, 'signup-email-input');
    expect(emailInput.value).toBe('tester@basset.io');
    expect(emailInput.getAttribute('disabled')).toBeDefined();

    const nameInput = getByTestId(container, 'signup-name-input');
    const passwordInput = getByTestId(container, 'signup-password-input');
    expect(passwordInput.getAttribute('type')).toBe('password');

    const submit = getByTestId(container, 'signup-submit');
    fireEvent.click(submit);
    expect(ApolloClient.mutate).not.toHaveBeenCalled();
    getByText(container, 'You must enter a name.');
    getByText(container, 'You must enter a password.');
    fireEvent.change(nameInput, { target: { value: 'name ' } });
    fireEvent.change(passwordInput, { target: { value: 'name ' } });
    fireEvent.click(submit);
    mockMutate = Promise.resolve({
      data: {
        acceptInvite: {
          user: {},
        },
      },
    });
    await waitForElement(
      () => getByTestId(container, 'invite-done'),
      container,
    );
  });
  test('invalid invite', async () => {
    mockQuery = Promise.reject({
      data: {
        validateInvite: null,
      },
      graphQLErrors: [{ message: 'Invalid Token' }],
    });
    const { container, queryByTestId } = renderWithRedux(<Invite {...PROPS} />);
    expect(queryByTestId('loader')).not.toBeNull();
    expect(ApolloClient.query).toHaveBeenCalled();

    await waitForElement(
      () =>
        getByText(
          container,
          'This invite request is invalid or has already been used.',
        ),
      container,
    );
  });
});

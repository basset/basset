import React from 'react';
import {
  fireEvent,
  cleanup,
  waitForElement,
  getByText,
  wait,
  queryByTestId,
} from 'react-testing-library';
import { store, renderWithRedux } from '../../tests/render-redux.js';

import * as userActions from '../../redux/user/actions.js';

let mockMutate = Promise.resolve();
jest.mock('../../graphql/client.js', () => {
  return {
    query: jest.fn(() => Promise.resolve()),
    mutate: jest.fn(() => mockMutate),
  };
});
import ApolloClient from '../../graphql/client.js';

import Login from './controller.jsx';

afterEach(cleanup);

describe('<Login />', () => {
  let PROPS;
  beforeEach(() => {
    global.window.__BASSET__ = {
      logins: {
        github: true,
      },
    };
    userActions.login = jest.fn(() => (dispatch, getState) => {});
    PROPS = {
      redirect: '',
    };
  });
  test('no github login', async () => {
    global.window.__BASSET__ = {
      logins: {
        github: false,
      },
    };
    const { queryByTestId } = renderWithRedux(<Login {...PROPS} />);
    expect(queryByTestId('test-github')).toBeNull();
  });
  test('login with email and password', async () => {
    const login = {
      user: {},
    };
    mockMutate = Promise.resolve({
      data: {
        login,
      },
    });
    const { getByTestId } = renderWithRedux(<Login {...PROPS} />);

    const emailInput = getByTestId('test-email');
    fireEvent.change(emailInput, {
      target: {
        value: 'tester@basset.io',
      },
    });
    const passwordInput = getByTestId('test-password');
    fireEvent.change(passwordInput, {
      target: {
        value: 'password',
      },
    });
    fireEvent.submit(passwordInput);
    expect(ApolloClient.mutate).toHaveBeenCalled();
    await wait(() => expect(userActions.login).toHaveBeenCalledWith(login, ''));
  });
  test('redirect', async () => {
    const login = {
      user: {},
    };
    mockMutate = Promise.resolve({
      data: {
        login,
      },
    });
    const { getByTestId } = renderWithRedux(
      <Login {...PROPS} redirect="/organizations" />,
    );

    const emailInput = getByTestId('test-email');
    fireEvent.change(emailInput, {
      target: {
        value: 'tester@basset.io',
      },
    });
    const passwordInput = getByTestId('test-password');
    fireEvent.change(passwordInput, {
      target: {
        value: 'password',
      },
    });
    fireEvent.submit(passwordInput);
    await wait(() =>
      expect(userActions.login).toHaveBeenCalledWith(login, '/organizations'),
    );
  });
  test('empty email', async () => {
    const { container, getByTestId } = renderWithRedux(<Login {...PROPS} />);

    const emailInput = getByTestId('test-email');
    fireEvent.submit(emailInput);
    expect(ApolloClient.mutate).not.toHaveBeenCalled();

    await waitForElement(
      () => getByText(container, 'You must enter an email.'),
      container,
    );
  });

  test('empty password', async () => {
    const { container, getByTestId } = renderWithRedux(<Login {...PROPS} />);

    const passwordInput = getByTestId('test-email');
    fireEvent.submit(passwordInput);
    expect(ApolloClient.mutate).not.toHaveBeenCalled();

    await waitForElement(
      () => getByText(container, 'You must enter a password.'),
      container,
    );
  });

  test('graphql error', async () => {
    mockMutate = Promise.reject({
      data: {
        login: false,
      },
      graphQLErrors: [{ message: 'Invalid credentials' }],
    });
    const { container, getByTestId } = renderWithRedux(<Login {...PROPS} />);

    const emailInput = getByTestId('test-email');
    fireEvent.change(emailInput, {
      target: {
        value: 'tester@basset.io',
      },
    });
    const passwordInput = getByTestId('test-password');
    fireEvent.change(passwordInput, {
      target: {
        value: 'password',
      },
    });
    fireEvent.submit(passwordInput);

    expect(ApolloClient.mutate).toHaveBeenCalled();

    await waitForElement(() => getByText(container, 'Invalid credentials'));
  });

  test('request error', async () => {
    mockMutate = Promise.reject({
      data: {
        login: false,
      },
    });
    const { container, getByTestId } = renderWithRedux(<Login {...PROPS} />);

    const emailInput = getByTestId('test-email');
    fireEvent.change(emailInput, {
      target: {
        value: 'tester@basset.io',
      },
    });
    const passwordInput = getByTestId('test-password');
    fireEvent.change(passwordInput, {
      target: {
        value: 'password',
      },
    });
    fireEvent.submit(passwordInput);

    expect(ApolloClient.mutate).toHaveBeenCalled();

    await waitForElement(() => queryByTestId(document, 'notification'));
  });
});

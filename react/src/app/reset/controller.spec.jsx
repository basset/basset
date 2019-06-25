import React from 'react';
import {
  render,
  fireEvent,
  cleanup,
  waitForElement,
  queryByTestId,
  wait,
} from 'react-testing-library';

let mockMutate = Promise.resolve();
let mockQuery = Promise.resolve();
jest.mock('../../graphql/client.js', () => {
  return {
    query: jest.fn(() => mockQuery),
    mutate: jest.fn(() => mockMutate),
  };
});
import ApolloClient from '../../graphql/client.js';
import Reset from './controller.jsx';

afterEach(cleanup);

describe('<Reset />', () => {
  let PROPS;
  beforeEach(() => {
    jest.clearAllMocks();
    PROPS = {
      id: 'id',
      token: 'token',
    };
    mockQuery = Promise.resolve({
      data: {
        validResetPassword: true,
      },
    });
    cleanup();
  });

  test('loader', async () => {
    const { getByTestId } = render(<Reset {...PROPS} />);
    getByTestId('loader');
    expect(ApolloClient.query).toHaveBeenCalled();
  });
  test('password is required', async () => {
    const { getByTestId, getByText } = render(<Reset {...PROPS} />);

    await waitForElement(() => getByTestId('reset-password-input'));
    const passwordInput = getByTestId('reset-password-input');
    fireEvent.change(passwordInput, {
      target: {
        value: '',
      },
    });
    fireEvent.submit(passwordInput);
    await waitForElement(() => getByText('You must enter a password'));
    expect(ApolloClient.mutate).not.toHaveBeenCalled();
  });
  test('reset password', async () => {
    mockMutate = Promise.resolve({
      data: {
        resetPassword: true,
      },
    });
    const { getByTestId, getByText } = render(<Reset {...PROPS} />);
    expect(ApolloClient.query).toHaveBeenCalled();

    await waitForElement(() => getByTestId('reset-password-input'));
    const passwordInput = getByTestId('reset-password-input');
    fireEvent.change(passwordInput, {
      target: {
        value: 'newpassword',
      },
    });
    fireEvent.submit(passwordInput);
    fireEvent.submit(passwordInput);
    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
    await waitForElement(() => getByText('Your password has been reset.'));
  });
  test('invalid token', async () => {
    mockQuery = Promise.resolve({
      data: {
        validResetPassword: false,
      },
    });
    const { getByText } = render(<Reset {...PROPS} />);

    await waitForElement(() =>
      getByText(
        'This password reset request is invalid or has already been used.',
      ),
    );
  });
  test('error reseting password', async () => {
    mockMutate = Promise.resolve();
    const { getByTestId } = render(<Reset {...PROPS} />);
    expect(ApolloClient.query).toHaveBeenCalled();

    await waitForElement(() => getByTestId('reset-password-input'));
    const passwordInput = getByTestId('reset-password-input');
    fireEvent.change(passwordInput, {
      target: {
        value: 'newpassword',
      },
    });
    fireEvent.submit(passwordInput);
    expect(ApolloClient.mutate).toHaveBeenCalled();
    await wait(() =>
      expect(queryByTestId(document, 'notification')).not.toBeNull(),
    );
  });
});

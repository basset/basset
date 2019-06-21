import React from 'react';
import {
  fireEvent,
  cleanup,
  waitForElement,
  getByText,
  queryByTestId,
  render,
} from 'react-testing-library';

import * as userActions from '../../redux/user/actions.js';

let mockMutate = Promise.resolve();
jest.mock('../../graphql/client.js', () => {
  return {
    query: jest.fn(() => Promise.resolve()),
    mutate: jest.fn(() => mockMutate),
  };
});

import ApolloClient from '../../graphql/client.js';

import Signup from './controller.jsx';

afterEach(cleanup);

describe('<Signup />', () => {
  beforeEach(() => {
    global.window.__BASSET__ = {
      private: false,
      logins: {
        github: true,
      },
    };
  });
  test('signup with name, email and password', async () => {
    mockMutate = Promise.resolve({
      data: {
        login: {
          user: {},
        },
      },
    });
    const { getByTestId } = render(<Signup />);

    const nameInput = getByTestId('signup-name-input');
    fireEvent.change(nameInput, {
      target: {
        value: 'Namer McNamer',
      },
    });
    const emailInput = getByTestId('signup-email-input');
    fireEvent.change(emailInput, {
      target: {
        value: 'tester@basset.io',
      },
    });
    const passwordInput = getByTestId('signup-password-input');
    fireEvent.change(passwordInput, {
      target: {
        value: 'password',
      },
    });
    fireEvent.submit(passwordInput);
    expect(ApolloClient.mutate).toHaveBeenCalled();
  });

  test('empty name', async () => {
    const { container, getByTestId } = render(<Signup />);

    const nameInput = getByTestId('signup-name-input');
    fireEvent.submit(nameInput);
    expect(ApolloClient.mutate).not.toHaveBeenCalled();

    await waitForElement(
      () => getByText(container, 'You must enter a name.'),
      container,
    );
  });

  test('empty email', async () => {
    const { container, getByTestId } = render(<Signup />);
    const nameInput = getByTestId('signup-name-input');
    fireEvent.change(nameInput, {
      target: {
        value: 'Namer McNamer',
      },
    });

    const emailInput = getByTestId('signup-email-input');
    fireEvent.submit(emailInput);
    expect(ApolloClient.mutate).not.toHaveBeenCalled();

    await waitForElement(
      () => getByText(container, 'You must enter an email.'),
      container,
    );
  });

  test('empty password', async () => {
    const { container, getByTestId } = render(<Signup />);
    const nameInput = getByTestId('signup-name-input');
    fireEvent.change(nameInput, {
      target: {
        value: 'Namer McNamer',
      },
    });
    const emailInput = getByTestId('signup-email-input');
    fireEvent.change(emailInput, {
      target: {
        value: 'tester@basset.io',
      },
    });
    const passwordInput = getByTestId('signup-password-input');
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
        signup: false,
      },
      graphQLErrors: [{ message: 'Email exists' }],
    });
    const { container, getByTestId } = render(<Signup />);

    const nameInput = getByTestId('signup-name-input');
    fireEvent.change(nameInput, {
      target: {
        value: 'Namer McNamer',
      },
    });
    const emailInput = getByTestId('signup-email-input');
    fireEvent.change(emailInput, {
      target: {
        value: 'tester@basset.io',
      },
    });
    const passwordInput = getByTestId('signup-password-input');
    fireEvent.change(passwordInput, {
      target: {
        value: 'password',
      },
    });
    fireEvent.submit(passwordInput);
    fireEvent.submit(passwordInput);

    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);

    await waitForElement(() => getByText(container, 'Email exists'));
  });

  test('request error', async () => {
    mockMutate = Promise.reject({
      data: {
        login: false,
      },
    });
    const { container, getByTestId } = render(<Signup />);
    const nameInput = getByTestId('signup-name-input');
    fireEvent.change(nameInput, {
      target: {
        value: 'Namer McNamer',
      },
    });
    const emailInput = getByTestId('signup-email-input');
    fireEvent.change(emailInput, {
      target: {
        value: 'tester@basset.io',
      },
    });
    const passwordInput = getByTestId('signup-password-input');
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

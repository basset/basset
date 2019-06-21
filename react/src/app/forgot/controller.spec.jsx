import React from 'react';
import {
  render,
  fireEvent,
  cleanup,
  waitForElement,
  getByTestId,
} from 'react-testing-library';

let mockMutate = Promise.resolve();
jest.mock('../../graphql/client.js', () => {
  return {
    query: jest.fn(() => Promise.resolve()),
    mutate: jest.fn(() => mockMutate),
  };
});
import ApolloClient from '../../graphql/client.js';
import Forgot from './controller.jsx';

afterEach(cleanup);

describe('<Forgot />', () => {
  test('submit email', async () => {
    mockMutate = Promise.resolve({
      data: {
        forgotPassword: true,
      },
    });
    const { container, queryByTestId } = render(<Forgot />);
    const emailInput = getByTestId(container, 'forgot-email-input');
    fireEvent.change(emailInput, {
      target: {
        value: 'tester@basset.io',
      },
    });
    fireEvent.submit(emailInput);
    expect(ApolloClient.mutate).toHaveBeenCalled();

    await waitForElement(() => getByTestId(container, 'forgot-success'));
  });
  test('notification error', async () => {
    mockMutate = Promise.reject({
      data: {
        forgotPassword: false,
      },
      errors: [{ message: 'wooops' }],
    });
    const { debug, getByTestId, container, queryByTestId } = render(<Forgot />);
    const emailInput = getByTestId('forgot-email-input');
    fireEvent.change(emailInput, {
      target: {
        value: 'tester@basset.io',
      },
    });
    fireEvent.submit(emailInput);
    expect(ApolloClient.mutate).toHaveBeenCalled();
    await waitForElement(() =>
      document.querySelectorAll('[data-test-id="notification"]'),
    );
    expect(queryByTestId('forgot-success')).toBeNull();
  });
});

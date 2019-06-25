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
import Activate from './controller.jsx';

afterEach(cleanup);

describe('<Activate />', () => {
  test('show activation success', async () => {
    const PROPS = {
      id: 'id',
      token: 'token',
    };
    mockMutate = Promise.resolve({
      data: {
        activate: true,
      },
    });
    const { container, queryByTestId } = render(<Activate {...PROPS} />);
    expect(ApolloClient.mutate).toHaveBeenCalled();

    await waitForElement(() => getByTestId(container, 'success'));
    expect(queryByTestId('error')).toBeNull();
  });
  test('show activation error', async () => {
    const PROPS = {
      id: 'id',
      token: 'token',
    };
    mockMutate = Promise.resolve({
      data: {
        activate: null,
      },
    });
    const { container, queryByTestId } = render(<Activate {...PROPS} />);
    expect(ApolloClient.mutate).toHaveBeenCalled();

    await waitForElement(() => getByTestId(container, 'error'));
    expect(queryByTestId('success')).toBeNull();
  });
});

import React from 'react';
import {
  fireEvent,
  cleanup,
  waitForElement,
  queryByTestId,
  wait,
  queryByText,
} from 'react-testing-library';
import { store, renderWithRedux } from '../../tests/render-redux.js';

let mockMutate = Promise.resolve();

jest.mock('../../graphql/client.js', () => {
  return {
    mutate: jest.fn(() => mockMutate),
  };
});
import ApolloClient from '../../graphql/client.js';
import * as userActions from '../../redux/user/actions.js';

import Profile from './controller.jsx';

afterEach(cleanup);

describe('<Profile />', () => {
  beforeEach(() => {
    window.__BASSET__ = {
      logins: {
        github: true,
      },
    };
    userActions.saveUser = jest.fn(() => (dispatch, getState) => {});
    store.dispatch(
      userActions.receiveUser({
        name: '',
        canCreateOrganizations: true,
        providers: {
          edges: [],
        },
      }),
    );
  });
  test('update profile', async () => {
    const { getByTestId } = renderWithRedux(<Profile />);
    const editBtn = getByTestId('edit-profile-name');
    editBtn.click();
    const input = getByTestId('profile-name-input');
    fireEvent.change(input, {
      target: {
        value: 'Billy bob',
      },
    });
    fireEvent.submit(input);
    expect(userActions.saveUser).toHaveBeenCalled();
  });
  test('saving error', async () => {
    store.dispatch(userActions.setError({ error: 'Uh' }));
    renderWithRedux(<Profile />);
    expect(queryByTestId(document, 'notification')).not.toBeNull();
  });
  test('change password', async () => {
    mockMutate = Promise.resolve({
      data: {
        changePassword: true,
      },
    });
    const { getByTestId, getByText } = renderWithRedux(<Profile />);
    const showPwdBtn = getByTestId('show-change-password');
    showPwdBtn.click();
    const input = getByTestId('change-password-input');
    fireEvent.change(input, {
      target: {
        value: '',
      },
    });
    fireEvent.submit(input);
    expect(ApolloClient.mutate).toHaveBeenCalledTimes(0);

    await waitForElement(() => getByText('You must enter a password'));

    fireEvent.change(input, {
      target: {
        value: 'password',
      },
    });
    fireEvent.submit(input);
    expect(ApolloClient.mutate).toHaveBeenCalledTimes(1);
    await wait(() =>
      expect(
        queryByText(document, 'Your password has been updated'),
      ).not.toBeNull(),
    );
  });
  test('error changing password', async () => {
    mockMutate = Promise.resolve();
    const { getByTestId } = renderWithRedux(<Profile />);

    const showPwdBtn = getByTestId('show-change-password');
    showPwdBtn.click();
    const input = getByTestId('change-password-input');
    fireEvent.change(input, {
      target: {
        value: 'test',
      },
    });
    fireEvent.submit(input);
    expect(ApolloClient.mutate).toHaveBeenCalled();
    await wait(() =>
      expect(queryByTestId(document, 'notification')).not.toBeNull(),
    );
  });
});

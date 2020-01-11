import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import UserMenu from './UserMenu.jsx';

afterEach(cleanup);

describe('<UserMenu />', () => {
  const DEFAULT_PROPS = {
    user: {
      name: 'Billy McBilly',
    },
    onLogout: jest.fn(),
    onLoginAs: jest.fn(),
  };
  it('should render a menu when clicked', () => {
    const { queryByTestId, getByTestId, queryByText } = render(
      <UserMenu {...DEFAULT_PROPS} />,
    );
    const userButton = getByTestId('user-menu');
    window.scrollTo = jest.fn();
    userButton.click();
    expect(queryByText('BM')).not.toBeNull();
    const profile = queryByTestId('profile');
    expect(profile.getAttribute('href')).toBe('/profile');
    const organizations = queryByTestId('organizations');
    expect(organizations.getAttribute('href')).toBe('/organizations');
    const logout = queryByTestId('logout');
    logout.click();
    expect(DEFAULT_PROPS.onLogout).toHaveBeenCalled();
  });
  it('should hide the menu when clicked off', () => {
    const { queryByTestId, getByTestId, queryByText } = render(
      <UserMenu {...DEFAULT_PROPS} />,
    );
    const userButton = getByTestId('user-menu');
    window.scrollTo = jest.fn();
    userButton.click();
    userButton.click();
    expect(queryByText('BM')).not.toBeNull();
    expect(queryByTestId('profile')).toBeNull();
    expect(queryByTestId('organizations')).toBeNull();
    expect(queryByTestId('logout')).toBeNull();
  });
  it('should not show login as for non admins', () => {
    const { queryByTestId, getByTestId, queryByText } = render(
      <UserMenu {...DEFAULT_PROPS} />,
    );
    const userButton = getByTestId('user-menu');
    window.scrollTo = jest.fn();
    userButton.click();
    expect(queryByTestId('login-as')).toBeNull();
  });

  it('should show login as for admins', () => {
    const PROPS = {
      ...DEFAULT_PROPS,
      user: {
        name: DEFAULT_PROPS.user.name,
        admin: true,
      }
    };
    const { queryByTestId, getByTestId, queryByText } = render(
      <UserMenu {...PROPS} />,
    );
    const userButton = getByTestId('user-menu');
    window.scrollTo = jest.fn();
    userButton.click();
    expect(queryByTestId('login-as')).not.toBeNull();
  });
});

import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import Notification from './Notification.jsx';

afterEach(cleanup);

describe('<Notification />', () => {
  const PROPS = {
    onClose: jest.fn(),
    message: 'ok ok',
  };
  it.each([['success'], ['error']])('should render %s notification', type => {
    const { queryByTestId } = render(<Notification {...PROPS} type={type} />);
    const closeNotification = queryByTestId('close-notification');
    expect(closeNotification).toBeTruthy();
    fireEvent.click(closeNotification);
    expect(PROPS.onClose).toHaveBeenCalledTimes(1);
    expect(queryByTestId('close-notification')).toBeNull();
  });
});

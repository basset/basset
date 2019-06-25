import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import Loader from './Loader.jsx';

afterEach(cleanup);

describe('<Loader />', () => {
  it('should render a loader without any props', () => {
    const { queryByTestId } = render(<Loader />);
    expect(queryByTestId('loader')).not.toBeNull();
    expect(queryByTestId('loader-fill')).toBeNull();
  });
  it('should render a app loader when fill is true', () => {
    const { debug, queryByTestId } = render(<Loader fill />);
    expect(queryByTestId('loader')).not.toBeNull();
    expect(queryByTestId('loader-fill')).not.toBeNull();
  });
});

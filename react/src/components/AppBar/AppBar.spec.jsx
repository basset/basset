import React from 'react';

import AppBar from './AppBar.jsx';

import { render } from 'react-testing-library';

describe('<AppBar />', () => {
  it('should render', () => {
    const wrapper = render(<AppBar>test</AppBar>);
    expect(wrapper.container).toMatchSnapshot();
  });
});

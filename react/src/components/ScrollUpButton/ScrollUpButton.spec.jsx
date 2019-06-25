import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import ScrollUpButton from './ScrollUpButton.jsx';

afterEach(cleanup);

describe('<ScrollUpButton />', () => {
  it('should create a scroll button which takes you to top', () => {
    const wrapper = render(
      <div style={{ height: '1200px' }} id="grommet">
        <ScrollUpButton />
      </div>,
    );
    const scrollingElement = document.getElementById('grommet');
    scrollingElement.scrollTop = 175;
    fireEvent.scroll(scrollingElement);
    const scrollUp = wrapper.queryByTestId('scroll-up');
    expect(scrollUp).toBeTruthy();
    fireEvent.click(scrollUp);
    fireEvent.scroll(wrapper.container);
    expect(scrollingElement.scrollTop).toBe(0);
    expect(wrapper.queryByTestId('scroll-up')).toBeNull();
  });
});

import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import { history } from '../../history.js';
import Link from './Link.jsx';

jest.mock('../../history.js', () => {
  return {
    history: {
      push: jest.fn(),
    },
  };
});

afterEach(cleanup);

describe('<Link />', () => {
  it('should render an href which uses history navigation', () => {
    const wrapper = render(<Link href="/test" label="Click" />);
    fireEvent.click(wrapper.getByText('Click'));
    expect(history.push).toHaveBeenCalledWith('/test');
  });

  it('should ignore modified clicks, with shift, cmd, meta keys', () => {
    const wrapper = render(<Link href="/test" label="Click" />);
    fireEvent.click(wrapper.getByText('Click'), { button: 2 });
    fireEvent.click(wrapper.getByText('Click'), { shiftKey: true });
    fireEvent.click(wrapper.getByText('Click'), { altKey: true });
    fireEvent.click(wrapper.getByText('Click'), { ctrlKey: true });
    fireEvent.click(wrapper.getByText('Click'), { metaKey: true });
    expect(history.push).toHaveBeenCalledTimes(0);
  });
});

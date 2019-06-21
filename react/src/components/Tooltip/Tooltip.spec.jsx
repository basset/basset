import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import Tooltip from './Tooltip.jsx';

afterEach(cleanup);
jest.useFakeTimers();

describe('<Tooltip />', () => {
  const PROPS = {
    label: 'More information',
    debounce: 0,
  };
  it('should render a tooltip when hovered', () => {
    const { queryByText, getByText } = render(
      <Tooltip {...PROPS}>
        <div>Hover me</div>
      </Tooltip>,
    );
    const hoverElement = getByText('Hover me');
    fireEvent.mouseEnter(hoverElement);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    jest.runAllTimers();
    expect(queryByText('More information')).not.toBeNull();
    fireEvent.mouseLeave(hoverElement);
    expect(queryByText('More information')).toBeNull();
  });
  it('should render a child label', () => {
    const label = (
      <div>
        <span>Label</span>
      </div>
    );
    const { queryByText, getByText } = render(
      <Tooltip {...PROPS} label={label}>
        <div>Hover me</div>
      </Tooltip>,
    );
    const hoverElement = getByText('Hover me');
    fireEvent.mouseEnter(hoverElement);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    jest.runAllTimers();
    expect(queryByText('Label')).not.toBeNull();
  });
});

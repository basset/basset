import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import LoadMoreButton from './LoadMoreButton.jsx';

afterEach(cleanup);

describe('<LoadMoreButton />', () => {
  const PROPS = {
    isLoadingMore: false,
    onLoadMore: jest.fn(),
  };
  it('should render a load more button', () => {
    const { getByTestId, queryByTestId } = render(
      <LoadMoreButton {...PROPS} />,
    );
    const button = getByTestId('load-more');
    expect(queryByTestId('loading-more')).toBeNull();
    button.click();
    expect(PROPS.onLoadMore).toHaveBeenCalled();
  });
  it('should render a loading more disabled button', () => {
    const { getByTestId, queryByTestId } = render(
      <LoadMoreButton {...PROPS} isLoadingMore />,
    );
    const button = getByTestId('loading-more');
    button.click();
    expect(queryByTestId('load-more')).toBeNull();
    expect(button.getAttribute('disabled')).not.toBeNull();
    expect(PROPS.onLoadMore).not.toHaveBeenCalled();
  });
});

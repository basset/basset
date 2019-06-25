import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'grommet';

import Loader from '../Loader/Loader.jsx';

const LoadMoreButton = React.memo(({ isLoadingMore, onLoadMore, ...props }) => {
  if (isLoadingMore) {
    return (
      <Button
        data-test-id="loading-more"
        icon={<Loader margin="none" size="18" />}
        label="Loading"
        reverse
        disabled
        {...props}
      />
    );
  }
  return (
    <Button
      data-test-id="load-more"
      label="Load more"
      onClick={onLoadMore}
      {...props}
    />
  );
});

LoadMoreButton.propTypes = {
  isLoadingMore: PropTypes.bool.isRequired,
  onLoadMore: PropTypes.func.isRequired,
};

export default LoadMoreButton;

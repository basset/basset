import React from 'react';
import { Grommet } from 'grommet';

import theme from './app/theme.js';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import Loader from './components/Loader/Loader.jsx';

export default ({ component, isNavigating }) => {
  if (!component) {
    return <Loader size="80" fill delay={0} />;
  }
  return (
    <Grommet theme={theme} full id="grommet">
      <ErrorBoundary>
        {isNavigating && <Loader size="80" fill delay={750} />}
        {component}
      </ErrorBoundary>
    </Grommet>
  );
};

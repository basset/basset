import React from 'react';

import { Box, Heading } from 'grommet';

import Link from '../../components/Link/Link.jsx';

const NotFound = React.memo(() => {
  return (
    <Box align="center">
      <Heading size="large" color="status-error">
        404
      </Heading>
      <Heading color="status-error">Page not found</Heading>
      <Heading size="small" level={2} textAlign="center">
        Sorry, the page you are looking for cannot be found
      </Heading>
      <Link.Button data-test-id="go-home" href="/" label="Go home" />
    </Box>
  );
});

export default NotFound;

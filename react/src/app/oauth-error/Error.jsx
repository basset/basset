import React from 'react';

import { Box, Heading } from 'grommet';

import Logo from '../../components/Logo/Logo.jsx';

const Error = React.memo(({ message }) => {
  return (
    <Box fill align="center" justify="center">
      <Box margin="medium">
        <Logo size="128px" />
      </Box>
      <Box width="medium" gap="medium" elevation="medium" pad="medium">
        <Heading size="small" level={2} textAlign="center" color="status-error">
          {message}
        </Heading>
      </Box>
    </Box>
  );
});

export default Error;

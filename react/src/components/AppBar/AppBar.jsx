import React from 'react';

import { Box } from 'grommet';

export default props => (
  <Box
    tag="header"
    direction="row"
    fill="horizontal"
    align="center"
    justify="between"
    background="brand"
    pad={{ left: 'medium', right: 'small', vertical: 'small' }}
    elevation="medium"
    style={{ zIndex: '1' }}
    {...props}
  />
);

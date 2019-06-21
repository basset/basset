import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Heading } from 'grommet';
import { Alert, StatusGood } from 'grommet-icons';

import Link from '../../components/Link/Link.jsx';
import Logo from '../../components/Logo/Logo.jsx';
import Loader from '../../components/Loader/Loader.jsx';

const Activate = ({ success, isLoading, requestError }) => {
  let children;
  if (isLoading) {
    return <Loader />;
  }
  if (success) {
    children = (
      <React.Fragment>
        <Box direction="row" align="center" gap="small">
          <StatusGood color="status-ok" />
          <Heading data-test-id="success" level={4}>
            Your account has been activated
          </Heading>
        </Box>
        <Text>You may now login to your account.</Text>
      </React.Fragment>
    );
  } else {
    children = (
      <React.Fragment>
        <Box direction="row" align="center" gap="small">
          <Alert color="status-error" />
          <Heading data-test-id="error" color="status-error" level={4}>
            Cannot activate
          </Heading>
        </Box>
        <Text>
          Either this account has already been activated or this link is
          invalid.
        </Text>
      </React.Fragment>
    );
  }

  return (
    <Box fill align="center" justify="center">
      <Box margin="medium">
        <Logo size="128px" />
      </Box>
      <Box width="medium" gap="medium" elevation="medium" pad="medium">
        {children}
        <Box direction="row" justify="between" margin={{ top: 'medium' }}>
          <Link data-test-id="login" href="/login/" label="Log in" />
          <Link.Button
            data-test-id="forgot-password"
            alignSelf="center"
            href="/forgot/"
            label="Forgot password"
          />
        </Box>
      </Box>
    </Box>
  );
};

Activate.propTypes = {
  success: PropTypes.bool.isRequired,
};

export default Activate;

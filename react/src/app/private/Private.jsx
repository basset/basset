import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Form, FormField, Heading, Text } from 'grommet';
import { Alert } from 'grommet-icons';

import Link from '../../components/Link/Link.jsx';
import Notification from '../../components/Notification/Notification.jsx';
import Logo from '../../components/Logo/Logo.jsx';

const Private = () => {
  return (
    <Box align="center">
      <Box margin="medium">
        <Logo size="128px" />
      </Box>
      <Heading size="large" color="status-error">
        Invite only
      </Heading>
      <Heading color="status-warning">Signing up is disabled</Heading>
      <Heading size="small" level={2} textAlign="center">
        This site only allows users to join by invitation.
      </Heading>
      <Link.Button data-test-id="go-login" href="/login" label="Login" />
    </Box>
  );
};

export default Private;

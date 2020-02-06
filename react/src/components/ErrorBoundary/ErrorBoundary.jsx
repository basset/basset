import React from 'react';
import { Box, Heading, Text } from 'grommet';
import { Alert } from 'grommet-icons';
import Logo from '../Logo/Logo.jsx';

export default class ErrorBoundary extends React.PureComponent {
  static getDerivedStateFromError(error) {
    return { hasError: true, error, };
  }

  state = {
    hasError: false,
    error: '',
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box fill align="center" justify="center">
          <Alert size="xlarge" color="status-warning" />
          <Heading data-test-id="error-boundary">Oh snap! Something went wrong.</Heading>
          <Heading level={2}>Try reloading the page...</Heading>
          <Logo size="128px"/>
        </Box>
      );
    }

    return this.props.children;
  }
}

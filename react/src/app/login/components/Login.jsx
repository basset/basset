import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Button, Form, FormField, Heading, Text } from 'grommet';
import { Alert } from 'grommet-icons';

import Link from '../../../components/Link/Link.jsx';
import Logo from '../../../components/Logo/Logo.jsx';
import Notification from '../../../components/Notification/Notification.jsx';
import GithubLogin from '../../../components/GithubLogin/GithubLogin.jsx';

const LogoContainer = styled(Box)`
  min-height: 64px;
  min-width: 64px;
`;
const BoxContainer = styled(Box)`
  min-height: 328px;
`;

export default class LoginPage extends React.PureComponent {
  static propTypes = {
    error: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    emailError: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    passwordError: PropTypes.string.isRequired,
    onChangeEmail: PropTypes.func.isRequired,
    onChangePassword: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    requestError: PropTypes.string.isRequired,
  };

  renderError = () => (
    <Box
      direction="row"
      align="center"
      gap="small"
      margin={{ vertical: 'medium' }}
    >
      <Alert color="status-critical" />
      <Text data-test-id="login-error" color="status-critical">
        {this.props.error}
      </Text>
    </Box>
  );

  renderRequestError = () => (
    <Notification type="error" message="There was an error trying to login." />
  );

  render() {
    return (
      <Box fill basis="80%" direction="column" align="center" justify="center">
        {this.props.requestError && this.renderRequestError()}
        <LogoContainer margin="medium">
          <Logo size="64px" />
        </LogoContainer>
        <GithubLogin label="Login with Github" multiple />
        <BoxContainer
          elevation="small"
          height="medium"
          width="medium"
          pad="medium"
          gap="medium"
          justify="center"
        >
          <Form onSubmit={this.props.onSubmit}>
            <FormField
              data-test-id="test-email"
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={this.props.email}
              onChange={this.props.onChangeEmail}
              error={this.props.emailError}
            />
            <FormField
              data-test-id="test-password"
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={this.props.password}
              onChange={this.props.onChangePassword}
              error={this.props.passwordError}
            />
            <Box
              direction="row"
              align="center"
              justify="between"
              margin={{ top: 'medium' }}
            >
              <Link href="/forgot/" label="Forgot Password" />
              <Button
                data-test-id="test-submit"
                type="submit"
                label="Login"
                primary
              />
            </Box>
            {this.props.error && this.renderError()}
          </Form>
          <Link alignSelf="center" href="/signup/" label="Sign up" />
        </BoxContainer>
      </Box>
    );
  }
}

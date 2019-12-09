import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Form, FormField, Heading, Text } from 'grommet';
import { Alert } from 'grommet-icons';

import Link from '../../components/Link/Link.jsx';
import Notification from '../../components/Notification/Notification.jsx';
import Logo from '../../components/Logo/Logo.jsx';
import GithubLogin from '../../components/LoginButtons/GithubLogin.jsx';
import BitbucketLogin from '../../components/LoginButtons/BitbucketLogin.jsx';
import GitLabLogin from '../../components/LoginButtons/GitLabLogin.jsx';

export default class SignUpPage extends React.PureComponent {
  static propTypes = {
    signupSuccess: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    nameError: PropTypes.string.isRequired,
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
      <Text data-test-id="error" color="status-critical">
        {this.props.error}
      </Text>
    </Box>
  );

  renderRequestError = () => (
    <Notification type="error" message="There was an error trying to login." />
  );

  renderSuccessfulSignUp = () => (
    <React.Fragment>
      <Heading level={4}>
        An activation email has been sent to {this.props.email} to verify your
        account.
      </Heading>
      <Link.Button
        data-test-id="signup-success"
        alignSelf="center"
        label="Login"
        href="/login"
      />
    </React.Fragment>
  );

  renderForm = () => (
    <Form onSubmit={this.props.onSubmit}>
      <FormField
        data-test-id="signup-email-input"
        label="Email"
        name="email"
        type="email"
        value={this.props.email}
        onChange={this.props.onChangeEmail}
        error={this.props.emailError}
      />
      <FormField
        data-test-id="signup-name-input"
        label="Name"
        name="name"
        type="text"
        value={this.props.name}
        onChange={this.props.onChangeName}
        error={this.props.nameError}
      />
      <FormField
        data-test-id="signup-password-input"
        label="Password"
        name="password"
        type="password"
        value={this.props.password}
        onChange={this.props.onChangePassword}
        error={this.props.passwordError}
      />
      <Box
        direction="column"
        align="end"
        margin={{ top: 'medium' }}
        gap="medium"
      >
        <Button
          data-test-id="signup-submit"
          type="submit"
          label="Sign up"
          primary
        />
        <Link alignSelf="center" href="/login/" label="Go to login" />
      </Box>
      {this.props.error && this.renderError()}
    </Form>
  );

  render() {
    const render = this.props.signupSuccess
      ? this.renderSuccessfulSignUp()
      : this.renderForm();
    return (
      <Box basis="80%" direction="column" align="center" justify="center" style={{minHeight: '100%'}}>
        {this.props.requestError && this.renderRequestError()}
        <Box margin="medium">
          <Logo size="64px" />
        </Box>
        <Box width="medium" gap="medium" elevation="medium" pad="medium" margin={{bottom: 'medium'}}>
          {render}
          {!this.props.signupSuccess && (
            <Box gap="small">
              <GithubLogin
                label="Signup with GitHub"
                redirect={this.props.redirect}
              />
              <BitbucketLogin
                label="Signup with Bitbucket"
                redirect={this.props.redirect}
              />
              <GitLabLogin
                label="Signup with GitLab"
                redirect={this.props.redirect}
              />
              <Box pad={{top: 'small'}}>
                <Text>
                  By signing up you are agreeing to our <a rel="noopener noreferrer" target="_blank" href="https://basset.io/terms">Terms of Service</a> and <a rel="noopener noreferrer" target="_blank" href="https://basset.io/privacy-policy">Privacy Policy</a>
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
}

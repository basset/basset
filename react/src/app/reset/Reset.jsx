import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Form, FormField, Heading } from 'grommet';

import Notification from '../../components/Notification/Notification.jsx';
import Link from '../../components/Link/Link.jsx';
import Logo from '../../components/Logo/Logo.jsx';
import Loader from '../../components/Loader/Loader.jsx';

export default class Reset extends React.PureComponent {
  static propTypes = {
    password: PropTypes.string.isRequired,
    passwordError: PropTypes.string.isRequired,
    resetSuccess: PropTypes.bool.isRequired,
    validToken: PropTypes.bool.isRequired,
    onChangePassword: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    requestError: PropTypes.string.isRequired,
  };

  renderInvalidToken = () => (
    <React.Fragment>
      <Heading data-test-id="error" level={4}>
        This password reset request is invalid or has already been used.
      </Heading>
      <Box direction="row" justify="between" margin={{ top: 'medium' }}>
        <Link href="/login/" label="Login" />
        <Link.Button
          alignSelf="center"
          href="/forgot/"
          label="Forgot password"
        />
      </Box>
    </React.Fragment>
  );

  renderPasswordResetSuccess = () => (
    <React.Fragment>
      <Heading level={4}>Your password has been reset.</Heading>
      <Link.Button
        data-test-id="success"
        alignSelf="center"
        href="/login/"
        label="Login"
      />
    </React.Fragment>
  );

  renderRequestError = () => (
    <Notification type="error" message={this.props.requestError} />
  );

  renderResetForm = () => (
    <Form onSubmit={this.props.onSubmit}>
      <Box margin="medium" responsive={false}>
        <Logo size="64px" />
      </Box>
      <Heading level={3} size="small">
        Reset your password
      </Heading>
      <FormField
        data-test-id="reset-password-input"
        label="New password"
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
        gap="large"
      >
        <Button
          data-test-id="reset-password-submit"
          type="submit"
          label="Reset"
          primary
        />
        <Link alignSelf="center" href="/login/" label="Go to login" />
      </Box>
    </Form>
  );

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    if (this.props.graphQLError) {
      throw new Error(this.props.graphQLError);
    }

    let children;
    if (!this.props.validToken) {
      children = this.renderInvalidToken();
    } else if (!this.props.resetSuccess) {
      children = this.renderResetForm();
    } else {
      children = this.renderPasswordResetSuccess();
    }

    return (
      <Box fill align="center" justify="center">
        {this.props.requestError && this.renderRequestError()}
        <Box width="medium" gap="large" elevation="medium" pad="medium">
          {children}
        </Box>
      </Box>
    );
  }
}

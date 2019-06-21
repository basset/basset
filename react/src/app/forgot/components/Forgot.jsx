import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Form, FormField, Heading } from 'grommet';

import Link from '../../../components/Link/Link.jsx';
import Logo from '../../../components/Logo/Logo.jsx';
import Notification from '../../../components/Notification/Notification.jsx';

export default class ForgotPage extends React.PureComponent {
  static propTypes = {
    email: PropTypes.string.isRequired,
    emailError: PropTypes.string.isRequired,
    emailSent: PropTypes.bool.isRequired,
    hasError: PropTypes.bool.isRequired,
    onChangeEmail: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  renderError = () => (
    <Notification
      type="error"
      message="There was an error trying to request a passport reset."
    />
  );

  renderForm = () => (
    <Form onSubmit={this.props.onSubmit}>
      <Heading level={3} size="small">
        Forgot my password
      </Heading>
      <FormField
        data-test-id="forgot-email-input"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={this.props.email}
        onChange={this.props.onChangeEmail}
        error={this.props.emailError}
      />
      <Box
        direction="column"
        align="end"
        justify="between"
        margin={{ top: 'large' }}
        gap="large"
      >
        <Button
          data-test-id="forgot-submit"
          type="submit"
          label="Reset my password"
          primary
        />
        <Link
          alignSelf="center"
          href="/login/"
          title="Log in"
          label="Go to login"
        />
      </Box>
    </Form>
  );

  renderEmailSent = () => (
    <React.Fragment>
      <Heading data-test-id="forgot-success" level={4}>
        {`An email will be sent to ${
          this.props.email
        } with instructions on how to reset your password.`}
      </Heading>
      <Link.Button alignSelf="center" href="/login/" label="Go to login" />
    </React.Fragment>
  );

  render() {
    const render = this.props.emailSent
      ? this.renderEmailSent()
      : this.renderForm();

    return (
      <Box fill align="center" justify="center">
        {this.props.hasError && this.renderError()}
        <Box margin="medium">
          <Logo size="64px" />
        </Box>
        <Box width="medium" gap="large" elevation="medium" pad="medium">
          {render}
        </Box>
      </Box>
    );
  }
}

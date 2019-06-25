import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Form, FormField, Text, Heading } from 'grommet';
import { Github } from 'grommet-icons';

import Notification from '../../components/Notification/Notification.jsx';
import Link from '../../components/Link/Link.jsx';
import Logo from '../../components/Logo/Logo.jsx';
import Loader from '../../components/Loader/Loader.jsx';

export default class Reset extends React.PureComponent {
  static propTypes = {
    invite: PropTypes.object,
    inviteAccepted: PropTypes.bool.isRequired,
    isUserLoggedIn: PropTypes.bool.isRequired,
    validInvite: PropTypes.bool.isRequired,
    redirect: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    requestError: PropTypes.string.isRequired,
    graphQLError: PropTypes.string.isRequired,
  };

  renderInvalidInvite = () => (
    <React.Fragment>
      <Heading data-test-id="invite-error" level={4}>
        This invite request is invalid or has already been used.
      </Heading>
      <Box direction="row" justify="between" margin={{ top: 'medium' }}>
        <Link href="/login/" label="Login" />
      </Box>
    </React.Fragment>
  );

  renderSignup = () => (
    <React.Fragment>
      <Box>
        <Text>
          You've been invited by{' '}
          <Text weight="bold">{this.props.invite.fromMember.user.name}</Text> to
          join <Text weight="bold">{this.props.invite.organization.name}</Text>
        </Text>
      </Box>
      <Box margin="medium">
        <Text weight="bold" color="status-warning">
          You must create an account or login first
        </Text>
      </Box>
      {__BASSET__.logins.github && (
        <React.Fragment>
          <Button
            data-test-id="test-github"
            color="dark-2"
            label="Signup with Github"
            icon={<Github />}
            href="/oauth/github"
          />
          <Heading size="small" level="4" alignSelf="center">
            {'or'}
          </Heading>
        </React.Fragment>
      )}
      <Box width="medium" gap="large" elevation="medium" pad="medium">
        {this.renderForm()}
        <Box direction="row" align="center" margin={{ top: 'small' }} />
      </Box>
    </React.Fragment>
  );

  renderForm = () => (
    <Form onSubmit={this.props.onSubmit}>
      <FormField
        data-test-id="signup-email-input"
        label="Email"
        name="email"
        type="email"
        value={this.props.invite.email}
        disabled
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
        direction="row"
        justify="between"
        align="end"
        margin={{ top: 'medium' }}
      >
        <Link href={`/login/?redirect=${this.props.redirect}`} label="Login" />
        <Button
          data-test-id="signup-submit"
          type="submit"
          label="Sign up"
          primary
        />
      </Box>
      {this.props.error && this.renderError()}
    </Form>
  );

  renderInviteAccepted = () => (
    <Box width="medium" gap="large" elevation="medium" pad="medium">
      <Heading level={4}>
        You have successfully joined {this.props.invite.organization.name}
      </Heading>
      <Button
        data-test-id="invite-done"
        alignSelf="center"
        onClick={this.props.onAcceptInvite}
        label="Go home"
      />
    </Box>
  );

  renderRequestError = () => (
    <Notification type="error" message={this.props.requestError} />
  );

  renderAcceptInviteForm = () => (
    <Box width="medium" gap="large" elevation="medium" pad="medium">
      <Form onSubmit={this.props.onSubmit}>
        <Heading level={3} size="small">
          You have been invited to join Basset
        </Heading>
        <Box>
          <Text>
            Invited by{' '}
            <Text weight="bold">{this.props.invite.fromMember.user.name}</Text>{' '}
            to join{' '}
            <Text weight="bold">{this.props.invite.organization.name}</Text>
          </Text>
        </Box>
        <Box
          direction="column"
          align="end"
          margin={{ top: 'medium' }}
          gap="large"
        >
          <Button
            data-test-id="invite-join"
            type="submit"
            label="Join"
            primary
          />
        </Box>
      </Form>
    </Box>
  );

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    let children;
    if (!this.props.validInvite) {
      children = this.renderInvalidInvite();
    } else if (!this.props.isUserLoggedIn) {
      children = this.renderSignup();
    } else if (!this.props.inviteAccepted) {
      children = this.renderAcceptInviteForm();
    } else {
      children = this.renderInviteAccepted();
    }

    return (
      <Box fill align="center" justify="center">
        {this.props.requestError && this.renderRequestError()}
        <Box margin="medium" responsive={false}>
          <Logo size="64px" />
        </Box>
        {children}
      </Box>
    );
  }
}

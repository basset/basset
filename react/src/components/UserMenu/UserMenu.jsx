import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, DropButton, Form, FormField, Layer, Text, TextInput } from 'grommet';
import { Alert, Logout, Login, UserSettings, Performance } from 'grommet-icons';
import ApolloClient from '../../graphql/client.js';
import loginAsMutation from '../../graphql/mutate/loginAs.js';
import { customUserMenu } from '../../plugin-options.js';

import Link from '../Link/Link.jsx';
import ProfileImage from '../ProfileImage/ProfileImage.jsx';

class UserMenu extends React.PureComponent {
  state = {
    open: false,
    showLoginAs: false,
    isRequesting: false,
    error: '',
    email: '',
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  handleOpen = () => {
    this.setState({
      open: true,
    });
  };

  handleOpenLoginAs = () => {
    this.setState({
      showLoginAs: true,
      email: '',
    })
  };

  handleCloseLoginAs = () => {
    this.setState({
      showLoginAs: false,
      email: '',
      error: '',
    });
  };

  handleChangeEmail = (event) => {
    const email = event.target.value;
    this.setState({
      email,
    });
  };

  handleLoginAs = async () => {
    const { email } = this.state;
    if (email.trim() === '') {
      this.setState({
        error: 'Email must be valid.'
      });
      return;
    }
    this.setState(state => ({
      isRequesting: true,
    }));
    try {
      const { data } = await ApolloClient.mutate({
        mutation: loginAsMutation,
        variables: {
          email,
        },
      });
      if (data.loginAs) {
        this.setState(state => ({
          ...state,
          isRequesting: false,
          showLoginAs: false,
          email: '',
          error: '',
        }));
        this.props.onLoginAs(data.loginAs);
      }
    } catch (error) {
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        this.setState(state => ({
          ...state,
          isRequesting: false,
          error: error.graphQLErrors[0].message,
        }));
      } else {
        this.setState(state => ({
          ...state,
          isRequesting: false,
          error: 'There was an error trying to login.',
        }));
      }
    }
  };

  renderLoginAs = () => {
    return (
      <Layer
        position="center"
        onClickOutside={this.handleCloseLoginAs}
      >
        <Box data-test-id="invite-member-dialog" pad="large" gap="medium">
          <Text>Enter the email of the user you want to login as</Text>
          {this.state.error && (
            <Box width="medium" direction="row" align="center" gap="small">
              <Alert color="status-critical" />
              <Text data-test-id="invite-error" color="status-critical">
                {this.state.error}
              </Text>
            </Box>
          )}
          <Box>
            <Form onSubmit={this.handleLoginAs}>
              <FormField label="Email">
                <TextInput
                  data-test-id="login-email-input"
                  placeholder="user@basset.io"
                  value={this.state.email}
                  onChange={this.handleChangeEmail}
                  name="email"
                  type="email"
                />
              </FormField>
            </Form>
          </Box>
          <Box direction="row" gap="medium" align="center" justify="end">
            <Button
              data-test-id="confirm-login-as"
              label="Login"
              onClick={this.handleLoginAs}
              disabled={this.state.isRequesting}
            />
            <Button
              data-test-id="cancel-login-as"
              label="Cancel"
              primary
              onClick={this.handleCloseLoginAs}
              disabled={this.state.isRequesting}
            />
          </Box>
        </Box>
      </Layer>
    )
  };

  showItem = item => {
    if (typeof item.show === 'function') {
      return item.show;
    }
    return () => item.show !== false;
  }

  render() {
    const { user, organization, onLogout } = this.props;
    return (
      <React.Fragment>
        <DropButton
          data-test-id="user-menu"
          alignSelf="center"
          open={this.state.open}
          onClose={this.handleClose}
          onOpen={this.handleOpen}
          dropContent={
            <Box>
              <Link.Button
                hoverIndicator="background"
                data-test-id="profile"
                href="/profile"
                onClick={this.handleClose}
              >
                <Box
                  margin={{ vertical: 'small', horizontal: 'medium' }}
                  direction="row"
                  align="center"
                  gap="small"
                >
                  <UserSettings />
                  <Text>Profile</Text>
                </Box>
              </Link.Button>
              <Link.Button
                hoverIndicator="background"
                href="/organizations"
                data-test-id="organizations"
                onClick={this.handleClose}
              >
                <Box
                  margin={{ vertical: 'small', horizontal: 'medium' }}
                  direction="row"
                  align="center"
                  gap="small"
                >
                  <Performance />
                  <Text>Organization</Text>
                </Box>
              </Link.Button>
              {customUserMenu.filter(item => this.showItem(item)(user, organization)).map((item, index) => (
                <Box key={index} onClick={this.handleClose}>
                  {item.component}
                </Box>
              ))}
              <Button
                onClick={onLogout}
                hoverIndicator="background"
                data-test-id="logout"
              >
                <Box
                  margin={{ vertical: 'small', horizontal: 'medium' }}
                  direction="row"
                  align="center"
                  gap="small"
                >
                  <Logout />
                  <Text>Logout</Text>
                </Box>
              </Button>
              {user.admin && (
                <Button
                  onClick={this.handleOpenLoginAs}
                  hoverIndicator="background"
                  data-test-id="login-as"
                >
                  <Box
                    margin={{ vertical: 'small', horizontal: 'medium' }}
                    direction="row"
                    align="center"
                    gap="small"
                  >
                    <Login />
                    <Text>Login As</Text>
                  </Box>
                </Button>
              )}
            </Box>
          }
          dropAlign={{ top: 'bottom', right: 'right' }}
        >
          <ProfileImage user={user} />
        </DropButton>
        {this.state.showLoginAs && this.renderLoginAs()}
      </React.Fragment>
    );
  }
}

UserMenu.propTypes = {
  user: PropTypes.object.isRequired,
  customMenu: PropTypes.array,
  onLogout: PropTypes.func.isRequired,
  onLoginAs: PropTypes.func.isRequired,
};

UserMenu.defaultProps = {
  customMenu: [],
};

export default UserMenu;

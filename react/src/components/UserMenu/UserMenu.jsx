import React from 'react';
import PropTypes from 'prop-types';

import { Box, Button, DropButton, Text } from 'grommet';

import { Logout, UserSettings, Performance } from 'grommet-icons';

import Link from '../Link/Link.jsx';
import ProfileImage from '../ProfileImage/ProfileImage.jsx';

class UserMenu extends React.PureComponent {
  state = {
    open: false,
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

  render() {
    const { user, onLogout } = this.props;
    return (
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
          </Box>
        }
        dropAlign={{ top: 'bottom', right: 'right' }}
      >
        <ProfileImage user={user} />
      </DropButton>
    );
  }
}

UserMenu.propTypes = {
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default UserMenu;
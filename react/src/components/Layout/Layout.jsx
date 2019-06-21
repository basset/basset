import React from 'react';
import PropTypes from 'prop-types';
import { Box, Heading, ResponsiveContext, Button, Layer } from 'grommet';
import { Menu, Close } from 'grommet-icons';

import AppBar from '../AppBar/AppBar.jsx';
import Logo from '../Logo/Logo.jsx';
import Link from '../Link/Link.jsx';
import UserMenu from '../UserMenu/UserMenu.jsx';
import OrganizationSwitcher from '../OrganizationSwitcher/OrganizationSwitcher-redux.jsx';

class Layout extends React.PureComponent {
  static propTypes = {
    user: PropTypes.object.isRequired,
    sidebar: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
    children: PropTypes.node,
    onLogout: PropTypes.func.isRequired,
  };

  static defaultProps = {
    sidebar: false,
  };

  state = {
    showSidebar: false,
  };

  showSidebar = size =>
    (size === 'small' &&
      this.state.showSidebar &&
      this.props.sidebar !== false) ||
    (size !== 'small' && this.props.sidebar !== false);

  handleShowSidebar = () => {
    this.setState({
      showSidebar: true,
    });
  };

  handleHideSidebar = () => {
    this.setState({
      showSidebar: false,
    });
  };

  renderSidebar = size => {
    if (size !== 'small') {
      if (this.props.sidebar === false) {
        return null;
      }
      return (
        <Box
          data-test-id="docked-sidebar"
          background="light-1"
          flex="shrink"
          align="start"
          width="medium"
          justify="start"
          pad="small"
        >
          {this.props.sidebar}
        </Box>
      );
    }
    if (this.state.showSidebar) {
      return (
        <Layer
          data-test-id="layer-sidebar"
          position="left"
          full="vertical"
          onClickOutside={this.handleHideSidebar}
          onEsc={this.handleHideSidebar}
          responsive={false}
        >
          <Box
            data-test-id="layer-sidebar"
            align="start"
            justify="start"
            width="medium"
            fill
            background="brand"
          >
            <Box margin="small">
              <Box align="end" margin="xsmall">
                <Button
                  data-test-id="close-sidebar"
                  onClick={this.handleHideSidebar}
                >
                  <Close />
                </Button>
              </Box>
              <Box margin="small">
                <OrganizationSwitcher />
              </Box>
            </Box>
            <Box background="light-2" fill pad="small">
              {this.props.sidebar !== false && this.props.sidebar}
            </Box>
          </Box>
        </Layer>
      );
    }
    return null;
  };

  render() {
    return (
      <ResponsiveContext.Consumer>
        {size => (
          <Box fill>
            <AppBar>
              <Box flex direction="row" align="center" gap="medium">
                <Link.Normal href="/">
                  <Box flex direction="row" align="center">
                    <Logo />
                    <Heading
                      level="4"
                      margin={{ vertical: 'none', left: 'small' }}
                    >
                      basset.io
                    </Heading>
                  </Box>
                </Link.Normal>
                {size !== 'small' && <OrganizationSwitcher />}
              </Box>
              <UserMenu user={this.props.user} onLogout={this.props.onLogout} />
              {size === 'small' && (
                <Box
                  margin={{ left: 'small' }}
                  height="40px"
                  align="center"
                  justify="center"
                >
                  <Button
                    data-test-id="open-sidebar"
                    onClick={this.handleShowSidebar}
                  >
                    <Box>
                      <Menu />
                    </Box>
                  </Button>
                </Box>
              )}
            </AppBar>
            <Box direction="row" flex>
              {this.renderSidebar(size)}
              <Box
                fill
                align="center"
                justify="start"
                pad="small"
                overflow={
                  size !== 'small' && this.props.sidebar ? 'auto' : 'none'
                }
              >
                {this.props.children}
              </Box>
            </Box>
          </Box>
        )}
      </ResponsiveContext.Consumer>
    );
  }
}

export default Layout;

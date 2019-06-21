import React from 'react';
import PropTypes from 'prop-types';
import { ApolloError } from 'apollo-client';
import { FormClose, StatusGood, StatusCritical } from 'grommet-icons';

import { Box, Button, Layer, Text } from 'grommet';

export default class Notification extends React.PureComponent {
  static propTypes = {
    onClose: PropTypes.func,
    type: PropTypes.string.isRequired,
    error: PropTypes.object,
    message: PropTypes.string,
  };

  state = {
    open: true,
  };

  onClose = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
    this.setState({ open: false });
  };

  types = {
    success: {
      background: 'status-ok',
      icon: <StatusGood />,
    },
    error: {
      background: 'status-error',
      icon: <StatusCritical />,
    },
  };

  render() {
    if (this.state.open) {
      let extra = null;
      if (
        this.props.error &&
        this.props.error instanceof ApolloError &&
        this.props.error.graphQLErrors.length > 0
      ) {
        extra = this.props.error.graphQLErrors[0].message;
      }
      const type = this.types[this.props.type];
      return (
        <Layer
          data-test-id="notification"
          position="bottom"
          modal={false}
          responsive={false}
          onEsc={this.onClose}
          plain
        >
          <Box align="center" pad={{ vertical: 'medium', horizontal: 'small' }}>
            <Box
              direction="row"
              gap="medium"
              round="medium"
              elevation="medium"
              pad={{ vertical: 'small', horizontal: 'medium' }}
              background={type.background}
            >
              <Box align="center" direction="row" gap="small">
                {type.icon}
                <Box>
                  <Text>{this.props.message}</Text>
                  <Text>{extra}</Text>
                </Box>
              </Box>
              <Button
                data-test-id="close-notification"
                onClick={this.onClose}
                hoverIndicator="background"
              >
                <Box align="center">
                  <FormClose />
                </Box>
              </Button>
            </Box>
          </Box>
        </Layer>
      );
    }
    return null;
  }
}

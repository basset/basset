import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Form, FormField, Heading, Text } from 'grommet';
import { Alert } from 'grommet-icons';

import Notification from 'components/Notification/Notification.jsx';

export default class CreateOrganization extends React.PureComponent {
  static propTypes = {
    error: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    nameError: PropTypes.string.isRequired,
    onChangeName: PropTypes.func.isRequired,
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
      <Text color="status-critical">{this.props.error}</Text>
    </Box>
  );

  renderRequestError = () => (
    <Notification
      type="error"
      message="There was an error trying to create this organization."
    />
  );

  render() {
    return (
      <Box fill align="center" justify="center">
        {this.props.requestError && this.renderRequestError()}
        <Form onSubmit={this.props.onSubmit}>
          <Heading level={3} size="small">
            Create an organization
          </Heading>
          <FormField
            data-test-id="create-organization-name-input"
            label="name"
            name="name"
            type="text"
            value={this.props.name}
            onChange={this.props.onChangeName}
            error={this.props.nameError}
          />
          <Button
            data-test-id="create-organization-submit"
            type="submit"
            label="Create organization"
            primary
          />
        </Form>
        {this.props.error && this.renderError()}
      </Box>
    );
  }
}

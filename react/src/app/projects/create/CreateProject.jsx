import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Form, FormField, Heading, Text, Select } from 'grommet';
import { Alert } from 'grommet-icons';

import Notification from 'components/Notification/Notification.jsx';

export default class CreateProject extends React.PureComponent {
  static propTypes = {
    error: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    }).isRequired,
    nameError: PropTypes.string.isRequired,
    onChangeName: PropTypes.func.isRequired,
    onChangeType: PropTypes.func.isRequired,
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
      message="There was an error trying to create this project."
    />
  );

  render() {
    console.log(this.props.type)
    console.log(this.props.projectTypes)
    return (
      <Box fill align="center" justify="center">
        {this.props.requestError && this.renderRequestError()}
        <Form onSubmit={this.props.onSubmit}>
          <Heading level={3} size="small">
            Create a project
          </Heading>
          <FormField
            data-test-id="create-project-name-input"
            label="Name"
            name="name"
            type="text"
            value={this.props.name}
            onChange={this.props.onChangeName}
            error={this.props.nameError}
          />
          <FormField
            label="Type"
            name="type"
            help="Value cannot be changed after creation"
          >
            <Select
              value={this.props.type}
              options={this.props.projectTypes}
              onChange={this.props.onChangeType}
              labelKey="label"
              valueKey="value"
            />
          </FormField>
          <Button
            data-test-id="create-project-submit"
            type="submit"
            label="Create project"
            primary
          />
          {this.props.error && this.renderError()}
        </Form>
      </Box>
    );
  }
}

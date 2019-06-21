import React from 'react';
import PropTypes from 'prop-types';

import { Box, Heading, Text } from 'grommet';
import { UserAdmin } from 'grommet-icons';

import Notification from '../../components/Notification/Notification.jsx';
import Link from '../../components/Link/Link.jsx';
import InlineField from '../../components/InlineField/InlineField.jsx';

class Organization extends React.PureComponent {
  static propTypes = {
    organization: PropTypes.object,
    user: PropTypes.object.isRequired,
    error: PropTypes.string.isRequired,
    isUpdating: PropTypes.bool.isRequired,
    onSaveName: PropTypes.func.isRequired,
  };

  static defaultProps = {
    organization: null,
  };

  renderError = error => (
    <Notification
      type="error"
      error={error}
      message={`There was an error trying to update this project`}
    />
  );

  render() {
    if (!this.props.organization) {
      return null;
    }
    const canCreate = this.props.user && this.props.user.canCreateOrganizations;
    const isAdmin = this.props.organization && this.props.organization.admin;

    return (
      <Box
        width="xlarge"
        pad={{ bottom: 'medium' }}
        border={{ side: 'bottom' }}
      >
        {this.props.error && this.renderError(this.props.error)}
        <Box direction="row" justify="between" align="center">
          <Heading level={4}>Details</Heading>
          {canCreate && (
            <Box
              margin={{
                bottom: 'medium',
              }}
            >
              <Link.Button
                data-test-id="create-organization"
                alignSelf="center"
                href="/organizations/create"
                label="Create organization"
              />
            </Box>
          )}
        </Box>
        {!isAdmin && (
          <Box
            margin={{ bottom: 'medium' }}
            pad="medium"
            background="light-1"
            direction="row"
            gap="small"
          >
            <UserAdmin color="status-warning" />
            <Text color="status-warning">
              Only admins can edit these settings.
            </Text>
          </Box>
        )}
        <InlineField
          testId="organization-name"
          canChange={this.props.organization.admin}
          title={'Organization name'}
          value={this.props.organization.name}
          onSubmit={this.props.onSaveName}
          isUpdating={this.props.isUpdating}
        />
      </Box>
    );
  }
}

export default Organization;

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
    error: PropTypes.shape({
      loading: PropTypes.string.isRequired,
      updating: PropTypes.string.isRequired,
    }).isRequired,
    isUpdating: PropTypes.bool.isRequired,
    onSaveName: PropTypes.func.isRequired,
  };

  static defaultProps = {
    organization: null,
  };

  renderError = (type, error) => (
    <Notification
      type="error"
      error={error}
      message={`There was an error trying to ${type} this organization`}
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
        {this.props.error.loading && this.renderError('retrieve', this.props.error.loading)}
        {this.props.error.updating && this.renderError('update', this.props.error.updating)}
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
        {this.props.organization.enforceSnapshotLimit && (
          <React.Fragment>
            <InlineField
              title="Monthly snapshot limit"
              value={this.props.organization.monthlySnapshotLimit}
              canChange={false}
            />
            <InlineField
              title="Current snapshot count"
              value={this.props.organization.currentSnapshotCount}
              canChange={false}
            />
            <InlineField
              title="Snapshots remaining"
              value={this.props.organization.monthlySnapshotLimit - this.props.organization.currentSnapshotCount}
              canChange={false}
            />
          </React.Fragment>
        )}
        {this.props.organization.enforceBuildRetention && (
          <InlineField
            title="Builds and snapshot retention"
            value={`${this.props.organization.buildRetentionPeriod} days`}
            canChange={false}
          />
        )}
      </Box>
    );
  }
}

export default Organization;

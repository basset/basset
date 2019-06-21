import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, DropButton, Button, Layer } from 'grommet';
import { StatusGood } from 'grommet-icons';
import moment from 'moment';

import ProfileImage from '../../../../components/ProfileImage/ProfileImage.jsx';
import Ellipsis from '../../../../components/Icons/Ellipsis.jsx';
import LoadMoreButton from '../../../../components/LoadMoreButton/LoadMoreButton.jsx';
import DataTable from '../../../../components/DataTable/DataTable.jsx';

class Members extends React.PureComponent {
  static propTypes = {
    user: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
    isLoadingMore: PropTypes.bool.isRequired,
    onLeaveOrganization: PropTypes.func.isRequired,
    onMore: PropTypes.func.isRequired,
  };

  getData = () => {
    return this.props.members.map(member => ({
      id: member.id,
      name: member.user.name,
      email: member.user.email,
      active: member.active,
      admin: member.admin,
      created: moment(parseInt(member.createdAt, 10)).format('YYYY-MM-DD'),
      userId: member.user.id,
      profileImage: member.user.profileImage,
    }));
  };

  renderDropContent = member => {
    if (member.userId !== this.props.user.id) {
      return (
        <Box>
          <Button
            data-test-id="remove-member"
            hoverIndicator="background"
            onClick={this.props.onRemoveMember(member.id)}
            disabled={this.props.isRequesting}
          >
            <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
              <Text size="small">Remove member</Text>
            </Box>
          </Button>
          <Button
            data-test-id="toggle-active"
            hoverIndicator="background"
            onClick={this.props.onToggleActivation(member.id)}
            disabled={this.props.isRequesting}
          >
            <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
              <Text size="small">
                Make member {member.active ? 'inactive' : 'active'}
              </Text>
            </Box>
          </Button>
          {this.props.organization.admin && (
            <Button
              data-test-id="toggle-admin"
              hoverIndicator="background"
              onClick={this.props.onToggleAdmin(member.id)}
              disabled={this.props.isRequesting}
            >
              <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
                <Text size="small">
                  Make member {member.admin ? 'regular' : 'admin'}
                </Text>
              </Box>
            </Button>
          )}
        </Box>
      );
    }
    return (
      <Box>
        <Button
          data-test-id="leave-organization"
          hoverIndicator="background"
          onClick={this.props.onLeaveOrganization}
        >
          <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
            <Text size="small">Leave organization</Text>
          </Box>
        </Button>
      </Box>
    );
  };

  renderDropdownMenu = member => {
    if (
      !this.props.organization.admin &&
      member.userId !== this.props.user.id
    ) {
      return null;
    }
    return (
      <DropButton
        data-test-id="member-dropdown"
        margin={{ vertical: 'small' }}
        dropContent={this.renderDropContent(member)}
        open={this.props.isDropdownOpen[member.id]}
        onClose={this.props.onDropdownClose(member.id)}
        onOpen={this.props.onDropdownOpen(member.id)}
      >
        <Ellipsis />
      </DropButton>
    );
  };

  render() {
    return (
      <Box basis="0">
        <DataTable
          columns={this.columns}
          data={this.getData()}
          primaryKey="id"
        />
        {this.props.showRemoveMemberConfirm && (
          <Layer
            data-test-id="remove-member-dialog"
            position="center"
            onClickOutside={this.props.onCancelRemoveMember}
          >
            <Box pad="medium" gap="large" width="medium">
              <Text>
                {this.props.memberToRemove.user.id === this.props.user.id
                  ? `Leave this organization?`
                  : `Remove ${
                      this.props.memberToRemove.user.name
                    } as a member?`}
              </Text>
              <Box direction="row" gap="medium" align="center" justify="end">
                <Button
                  data-test-id="confirm-remove-member"
                  label="Yes"
                  onClick={this.props.onRemoveMemberConfirm}
                  disabled={this.props.isRequesting}
                />
                <Button
                  data-test-id="cancel-remove-member"
                  label="No"
                  primary
                  onClick={this.props.onCancelRemoveMember}
                  disabled={this.props.isRequesting}
                />
              </Box>
            </Box>
          </Layer>
        )}
        {this.props.hasNextPage && (
          <Box align="center">
            <LoadMoreButton
              data-test-id="load-more-members"
              isLoadingMore={this.props.isLoadingMore}
              onLoadMore={this.props.onMore}
            />
          </Box>
        )}
      </Box>
    );
  }

  columns = [
    {
      property: 'profileImage',
      header: null,
      render: member => <ProfileImage user={member} />,
    },
    {
      property: 'name',
      header: <Text>Name</Text>,
      render: member =>
        member.userId === this.props.user.id ? (
          <Text weight="bold">{member.name}</Text>
        ) : (
          <Text>{member.name}</Text>
        ),
    },
    {
      property: 'email',
      header: <Text>Email</Text>,
    },
    {
      property: 'admin',
      header: <Text>Admin</Text>,
      render: member =>
        member.admin ? <StatusGood color="status-ok" /> : null,
    },
    {
      property: 'active',
      header: <Text>Status</Text>,
      render: member =>
        member.active ? (
          <Text color="brand">Active</Text>
        ) : (
          <Text color="status-warning">Inactive</Text>
        ),
    },
    {
      property: 'created',
      header: <Text>Member since</Text>,
      render: member => (
        <Text data-test-id="ignore-element">{member.created}</Text>
      ),
    },
    {
      property: 'id',
      header: null,
      render: this.renderDropdownMenu,
    },
  ];
}

export default Members;

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, DropButton, Button, Layer } from 'grommet';
import { StatusGood } from 'grommet-icons';
import moment from 'moment';

import ProfileImage from '../../../../components/ProfileImage/ProfileImage.jsx';
import Ellipsis from '../../../../components/Icons/Ellipsis.jsx';
import LoadMoreButton from '../../../../components/LoadMoreButton/LoadMoreButton.jsx';
import DataTable from '../../../../components/DataTable/DataTable.jsx';

class Invites extends React.PureComponent {
  static propTypes = {
    organization: PropTypes.object.isRequired,
    invites: PropTypes.array.isRequired,
    onDeleteInvite: PropTypes.func.isRequired,
  };

  getData = () => {
    return this.props.invites.map(invite => ({
      id: invite.id,
      email: invite.email,
      accepted: invite.accepted,
      updated: moment(parseInt(invite.updatedAt, 10)).format(
        'YYYY-MM-DD hh:mm a',
      ),
      name: invite.fromMember.user.name,
      profileImage: invite.fromMember.user.profileImage,
    }));
  };

  renderDropContent = invite => {
    return (
      <Box>
        <Button
          data-test-id="delete-invite"
          hoverIndicator="background"
          onClick={this.props.onDeleteInvite(invite.id)}
          disabled={this.props.isRequesting}
        >
          <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
            <Text size="small">Delete invite</Text>
          </Box>
        </Button>
        <Button
          data-test-id="resend-invite"
          hoverIndicator="background"
          onClick={this.props.onResendInvite(invite.id)}
          disabled={this.props.isRequesting}
        >
          <Box margin={{ vertical: 'small', horizontal: 'medium' }}>
            <Text size="small">Resent invite</Text>
          </Box>
        </Button>
      </Box>
    );
  };

  renderDropdownMenu = invite => {
    if (!this.props.organization.admin || invite.accepted) {
      return null;
    }
    return (
      <DropButton
        data-test-id="invite-dropdown"
        margin={{ vertical: 'small' }}
        dropContent={this.renderDropContent(invite)}
        open={this.props.isDropdownOpen[invite.id]}
        onClose={this.props.onDropdownClose(invite.id)}
        onOpen={this.props.onDropdownOpen(invite.id)}
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
        {this.props.showDeleteInviteConfirm && (
          <Layer
            position="center"
            onClickOutside={this.props.onCancelDeleteInvite}
          >
            <Box pad="medium" gap="large" width="medium">
              <Text>
                Delete the invite for {this.props.inviteToDelete.email}?
              </Text>
              <Box direction="row" gap="medium" align="center" justify="end">
                <Button
                  data-test-id="confirm-delete-invite"
                  label="Yes"
                  onClick={this.props.onDeleteInviteConfirm}
                  disabled={this.props.isRequesting}
                />
                <Button
                  data-test-id="cancel-delete-invite"
                  label="No"
                  primary
                  onClick={this.props.onCancelDeleteInvite}
                  disabled={this.props.isRequesting}
                />
              </Box>
            </Box>
          </Layer>
        )}
        {this.props.hasNextPage && (
          <Box align="center">
            <LoadMoreButton
              data-test-id="load-more-invites"
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
      property: 'email',
      header: <Text>Email</Text>,
    },
    {
      property: 'admin',
      header: <Text>Accepted</Text>,
      render: invite =>
        invite.accepted ? <StatusGood color="status-ok" /> : null,
    },
    {
      property: 'active',
      header: <Text>Invite from</Text>,
      render: invite => (
        <Box direction="row" align="center" gap="small">
          <ProfileImage user={invite} />
          <Text>{invite.name}</Text>
        </Box>
      ),
    },
    {
      property: 'updated',
      header: <Text>Sent / Accepted</Text>,
      render: invite => (
        <Text data-test-id="ignore-element">{invite.updated}</Text>
      ),
    },
    {
      property: 'id',
      header: null,
      render: this.renderDropdownMenu,
    },
  ];
}

export default Invites;

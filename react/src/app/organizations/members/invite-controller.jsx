import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ApolloClient from '../../../graphql/client.js';
import invitesQuery from '../../../graphql/query/getInvites.js';
import deleteInviteMutation from '../../../graphql/mutate/deleteInvite.js';
import resendInviteMutation from '../../../graphql/mutate/resendInvite.js';

import { getCurrentOrganization } from '../../../redux/organizations/selectors.js';
import { getUser } from '../../../redux/user/selectors.js';

import Invites from './components/Invites.jsx';
import Notification from '../../../components/Notification/Notification.jsx';
import Loader from '../../../components/Loader/Loader.jsx';

class InviteController extends React.PureComponent {
  static propTypes = {
    user: PropTypes.object.isRequired,
    organization: PropTypes.object,
  };

  static defaultProps = {
    organization: null,
  };

  state = {
    invites: [],
    currentCursor: null,
    isLoading: true,
    isLoadingMore: false,
    hasNextPage: false,
    error: '',
    isDropdownOpen: {},
    isRequesting: false,
    showDeleteInviteConfirm: false,
    inviteToDelete: null,
    inviteResent: false,
  };

  requestInvites = async after => {
    try {
      const {
        data: { invites },
      } = await ApolloClient.query({
        query: invitesQuery,
        variables: {
          organizationId: this.props.organization.id,
          first: 100,
          after,
        },
      });
      return invites;
    } catch (error) {
      console.error(error);
    }
  };

  getInvites = async () => {
    try {
      const invites = await this.requestInvites(null);
      const currentCursor = this.getCursor(invites);
      this.setState(state => ({
        ...state,
        invites: invites.edges.map(e => e.node),
        isLoading: false,
        error: '',
        currentCursor,
        hasNextPage: invites.pageInfo.hasNextPage,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  getMoreInvites = async () => {
    try {
      this.setState(state => ({
        ...state,
        isLoadingMore: true,
      }));
      const invites = await this.requestInvites(this.state.currentCursor);
      const currentCursor = this.getCursor(invites);
      this.setState(state => ({
        ...state,
        invites: [...state.invites, ...invites.edges.map(e => e.node)],
        isLoadingMore: false,
        error: '',
        currentCursor,
        hasNextPage: invites.pageInfo.hasNextPage,
      }));
    } catch (error) {
      this.setState(state => ({
        ...state,
        isLoadingMore: false,
        error: 'There was an error trying to load more invites',
      }));
    }
  };

  getCursor = rows =>
    rows.length > 0 ? rows.edges[rows.edges.length - 1].cursor : null;

  componentDidMount() {
    this.getInvites();
  }

  componentDidUpdate(prevProps) {
    if (this.props.invite && !prevProps.invite) {
      this.getInvites();
    }
  }

  handleClose = inviteId => () => {
    this.closeDropdown(inviteId);
  };

  handleOpen = inviteId => () => {
    this.setState(state => ({
      isDropdownOpen: {
        ...state.isDropdownOpen,
        [inviteId]: true,
      },
    }));
  };

  closeDropdown = inviteId => {
    this.setState(state => ({
      isDropdownOpen: {
        ...state.isDropdownOpen,
        [inviteId]: false,
      },
      isRequesting: false,
      inviteToDelete: null,
      showDeleteInviteConfirm: false,
    }));
  };

  handleDeleteInviteConfirm = inviteId => async () => {
    const invite = this.state.invites.find(m => m.id === inviteId);
    this.setState(state => ({
      ...state,
      inviteToDelete: invite,
      showDeleteInviteConfirm: true,
      isDropdownOpen: {
        ...state.isDropdownOpen,
        [inviteId]: false,
      },
    }));
  };

  handleCancelDeleteInvite = () => {
    this.setState(state => ({
      ...state,
      inviteToDelete: null,
      showDeleteInviteConfirm: false,
    }));
  };

  handleDeleteInvite = async () => {
    this.setState(state => ({
      ...state,
      isRequesting: true,
    }));
    try {
      const {
        data: { deleteInvite },
      } = await ApolloClient.mutate({
        mutation: deleteInviteMutation,
        variables: {
          id: this.state.inviteToDelete.id,
        },
      });
      if (deleteInvite) {
        this.setState(state => ({
          ...state,
          invites: state.invites.filter(m => m.id !== state.inviteToDelete.id),
          isRequesting: false,
          inviteToDelete: null,
          showDeleteInviteConfirm: false,
        }));
      }
    } catch (error) {
      this.setState(state => ({
        ...state,
        isRequesting: false,
        error: 'There was an error trying to delete this invite.',
      }));
      console.error(error);
    }
  };

  handleResendInvite = inviteId => async () => {
    this.setState(state => ({
      ...state,
      isRequesting: true,
      inviteResent: false,
    }));
    try {
      const {
        data: { resendInvite },
      } = await ApolloClient.mutate({
        mutation: resendInviteMutation,
        variables: {
          id: inviteId,
        },
      });
      this.setState(state => ({
        ...state,
        invites: state.invites.map(invite => {
          if (invite.id === inviteId) {
            return {
              ...invite,
              ...resendInvite,
            };
          } else {
            return {
              ...invite,
            };
          }
        }),
        isRequesting: false,
        isDropdownOpen: {
          ...state.isDropdownOpen,
          [inviteId]: false,
        },
        inviteResent: true,
      }));
    } catch (error) {
      this.setState(state => ({
        ...state,
        isRequesting: false,
        error: 'There was an error trying to resend the invite',
      }));
      this.closeDropdown(inviteId);
    }
  };

  render() {
    if (this.state.isLoading || !this.props.organization) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        {this.state.inviteResent && (
          <Notification type="success" message="Email resent" />
        )}
        {this.state.error && (
          <Notification type="error" message={this.state.error} />
        )}
        <Invites
          isRequesting={this.state.isRequesting}
          isDropdownOpen={this.state.isDropdownOpen}
          invites={this.state.invites}
          inviteToDelete={this.state.inviteToDelete}
          organization={this.props.organization}
          showDeleteInviteConfirm={this.state.showDeleteInviteConfirm}
          onDropdownClose={this.handleClose}
          onDropdownOpen={this.handleOpen}
          onDeleteInvite={this.handleDeleteInviteConfirm}
          onResendInvite={this.handleResendInvite}
          onDeleteInviteConfirm={this.handleDeleteInvite}
          onCancelDeleteInvite={this.handleCancelDeleteInvite}
          onMore={this.getMoreMembers}
          hasNextPage={this.state.hasNextPage}
          isLoadingMore={this.state.isLoadingMore}
        />
      </React.Fragment>
    );
  }
}

export { InviteController };

const mapState = state => ({
  user: getUser(state),
  organization: getCurrentOrganization(state),
});

export default connect(mapState)(InviteController);

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ApolloClient from '../../../graphql/client.js';
import membersQuery from '../../../graphql/query/getMembers.js';
import removeMemberMutation from '../../../graphql/mutate/removeMember.js';
import updateMemberMutation from '../../../graphql/mutate/updateMember.js';

import { getCurrentOrganization } from '../../../redux/organizations/selectors.js';
import { getUser } from '../../../redux/user/selectors.js';
import { leaveCurrentOrganization } from '../../../redux/organizations/actions.js';

import Members from './components/Members.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
import Notification from '../../../components/Notification/Notification.jsx';

class MemberController extends React.PureComponent {
  static propTypes = {
    user: PropTypes.object.isRequired,
    organization: PropTypes.object,
    onLeaveOrganization: PropTypes.func.isRequired,
  };

  static defaultProps = {
    organization: null,
  };

  state = {
    members: [],
    hasNextPage: false,
    currentCursor: null,
    isLoading: true,
    isLoadingMore: false,
    error: '',
    isDropdownOpen: {},
    isRequesting: false,
    showRemoveMemberConfirm: false,
    memberToRemove: null,
  };

  requestMembers = async after => {
    try {
      const {
        data: { organizationMembers },
      } = await ApolloClient.query({
        query: membersQuery,
        variables: {
          organizationId: this.props.organization.id,
          first: 100,
          after,
        },
      });
      return organizationMembers;
    } catch (error) {
      console.error(error);
    }
  };

  getMembers = async () => {
    try {
      const organizationMembers = await this.requestMembers(null);
      const currentCursor = this.getCursor(organizationMembers);
      this.setState(state => ({
        ...state,
        members: organizationMembers.edges.map(e => e.node),
        isLoading: false,
        error: '',
        currentCursor,
        hasNextPage: organizationMembers.pageInfo.hasNextPage,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  getMoreMembers = async () => {
    try {
      this.setState(state => ({
        ...state,
        isLoadingMore: true,
      }));
      const organizationMembers = await this.requestMembers(
        this.state.currentCursor,
      );
      const currentCursor = this.getCursor(organizationMembers);
      this.setState(state => ({
        ...state,
        members: [
          ...state.members,
          ...organizationMembers.edges.map(e => e.node),
        ],
        isLoadingMore: false,
        error: '',
        currentCursor,
        hasNextPage: organizationMembers.pageInfo.hasNextPage,
      }));
    } catch (error) {
      this.setState(state => ({
        ...state,
        isLoadingMore: false,
        error: 'There was an error trying to load more members',
      }));
    }
  };

  getCursor = rows =>
    rows.length > 0 ? rows.edges[rows.edges.length - 1].cursor : null;

  componentDidMount() {
    this.getMembers();
  }

  handleClose = memberId => () => {
    this.closeDropdown(memberId);
  };

  handleOpen = memberId => () => {
    this.setState(state => ({
      isDropdownOpen: {
        ...state.isDropdownOpen,
        [memberId]: true,
      },
    }));
  };

  closeDropdown = memberId => {
    this.setState(state => ({
      isDropdownOpen: {
        ...state.isDropdownOpen,
        [memberId]: false,
      },
      memberToRemove: null,
      showRemoveMemberConfirm: false,
    }));
  };

  handleRemoveMemberConfirm = memberId => async () => {
    const member = this.state.members.find(m => m.id === memberId);
    this.setState(state => ({
      ...state,
      memberToRemove: member,
      showRemoveMemberConfirm: true,
      isDropdownOpen: {
        ...state.isDropdownOpen,
        [memberId]: false,
      },
    }));
  };

  handleCancelRemoveMember = () => {
    this.setState(state => ({
      ...state,
      memberToRemove: null,
      showRemoveMemberConfirm: false,
    }));
  };

  handleRemoveMember = async () => {
    this.setState(state => ({
      ...state,
      isRequesting: true,
    }));
    try {
      const {
        data: { removeMember },
      } = await ApolloClient.mutate({
        mutation: removeMemberMutation,
        variables: {
          id: this.state.memberToRemove.id,
        },
      });
      if (removeMember) {
        if (this.state.memberToRemove.user.id === this.props.user.id) {
          this.props.onLeaveOrganization();
        }
        this.setState(state => ({
          ...state,
          members: state.members.filter(m => m.id !== state.memberToRemove.id),
          isRequesting: false,
          memberToRemove: null,
          showRemoveMemberConfirm: false,
        }));
      } else {
        throw new Error('Member was not removed');
      }
    } catch (error) {
      this.setState(state => ({
        ...state,
        isRequesting: false,
        error: 'There was an error trying to remove this member',
      }));
    }
  };

  updateMember = async member => {
    this.setState(state => ({
      ...state,
      isRequesting: true,
    }));
    try {
      const {
        data: { updateMember },
      } = await ApolloClient.mutate({
        mutation: updateMemberMutation,
        variables: {
          member: member,
        },
      });
      this.setState(state => ({
        ...state,
        members: state.members.map(m => {
          if (m.id === updateMember.id) {
            return {
              ...m,
              ...updateMember,
            };
          } else {
            return {
              ...m,
            };
          }
        }),
        isRequesting: false,
        isDropdownOpen: {
          ...state.isDropdownOpen,
          [member.id]: false,
        },
      }));
    } catch (error) {
      this.setState(state => ({
        ...state,
        isRequesting: false,
        error: 'There was an error trying to update this member',
      }));
      this.closeDropdown(member);
    }
  };

  handleToggleActivation = memberId => async () => {
    const member = this.state.members.find(m => m.id === memberId);
    await this.updateMember({
      id: member.id,
      active: !member.active,
    });
  };

  handleToggleAdmin = memberId => async () => {
    const member = this.state.members.find(m => m.id === memberId);
    await this.updateMember({
      id: member.id,
      admin: !member.admin,
    });
  };

  handleLeaveOrganization = () => {
    const member = this.state.members.find(
      m => m.user.id === this.props.user.id,
    );
    const removeMemberConfirm = this.handleRemoveMemberConfirm(member.id);
    removeMemberConfirm();
  };

  render() {
    if (this.state.isLoading || !this.props.organization) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        {this.state.error && (
          <Notification type="error" message={this.state.error} />
        )}
        <Members
          isRequesting={this.state.isRequesting}
          isDropdownOpen={this.state.isDropdownOpen}
          members={this.state.members}
          memberToRemove={this.state.memberToRemove}
          organization={this.props.organization}
          showRemoveMemberConfirm={this.state.showRemoveMemberConfirm}
          user={this.props.user}
          onDropdownClose={this.handleClose}
          onDropdownOpen={this.handleOpen}
          onLeaveOrganization={this.handleLeaveOrganization}
          onRemoveMember={this.handleRemoveMemberConfirm}
          onToggleActivation={this.handleToggleActivation}
          onToggleAdmin={this.handleToggleAdmin}
          onRemoveMemberConfirm={this.handleRemoveMember}
          onCancelRemoveMember={this.handleCancelRemoveMember}
          onMore={this.getMoreMembers}
          hasNextPage={this.state.hasNextPage}
          isLoadingMore={this.state.isLoadingMore}
        />
      </React.Fragment>
    );
  }
}

export { MemberController };

const mapState = state => ({
  user: getUser(state),
  organization: getCurrentOrganization(state),
});
const mapActions = dispatch => ({
  onLeaveOrganization: () => {
    dispatch(leaveCurrentOrganization());
  },
});

export default connect(
  mapState,
  mapActions,
)(MemberController);
null;

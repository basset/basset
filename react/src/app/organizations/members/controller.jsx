import React from 'react';
import { connect } from 'react-redux';

import { getCurrentOrganization } from '../../../redux/organizations/selectors.js';
import { getUser } from '../../../redux/user/selectors.js';

import ApolloClient from '../../../graphql/client.js';
import createInviteMutation from '../../../graphql/mutate/createInvite.js';

import OrganizationTabs from './components/Tabs.jsx';
import Notification from '../../../components/Notification/Notification.jsx';

class MembersPage extends React.PureComponent {
  state = {
    showInviteMemberDialog: false,
    email: '',
    isRequesting: false,
    activeTab: 0,
    invite: false,
  };

  handleChangeTab = index => {
    this.setState(state => ({
      ...state,
      activeTab: index,
    }));
  };

  handleCancelInvite = () => {
    this.setState(state => ({
      ...state,
      showInviteMemberDialog: false,
      email: '',
    }));
  };

  handleInvite = () => {
    this.setState(state => ({
      ...state,
      showInviteMemberDialog: true,
    }));
  };

  handleConfirmInvite = async () => {
    this.setState(state => ({
      ...state,
      isRequesting: true,
      requestError: '',
      error: '',
      invite: false,
    }));
    try {
      const {
        data: { createInvite },
      } = await ApolloClient.mutate({
        mutation: createInviteMutation,
        variables: {
          email: this.state.email,
          organizationId: this.props.organization.id,
        },
      });
      if (createInvite) {
        this.setState(state => ({
          ...state,
          isRequesting: false,
          email: '',
          showInviteMemberDialog: false,
          invite: true,
        }));
      }
    } catch (error) {
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        this.setState(state => ({
          ...state,
          isRequesting: false,
          error: error.graphQLErrors[0].message,
          requestError: '',
        }));
      } else {
        this.setState(state => ({
          ...state,
          isRequesting: false,
          requestError: 'There was an error trying to invite a new member.',
        }));
      }
    }
  };

  handleChangeEmail = event => {
    const email = event.target.value;
    this.setState(state => ({
      ...state,
      email,
    }));
  };

  render() {
    return (
      <React.Fragment>
        {this.state.requestError && (
          <Notification type="error" message={this.state.requestError} />
        )}
        <OrganizationTabs
          organization={this.props.organization}
          onCancelInvite={this.handleCancelInvite}
          onConfirmInvite={this.handleConfirmInvite}
          error={this.state.error}
          email={this.state.email}
          onChangeEmail={this.handleChangeEmail}
          isRequesting={this.state.isRequesting}
          onInvite={this.handleInvite}
          onChangeTab={this.handleChangeTab}
          activeTab={this.state.activeTab}
          showInviteMemberDialog={this.state.showInviteMemberDialog}
          invite={this.state.invite}
        />
      </React.Fragment>
    );
  }
}

export { MembersPage };

const mapState = state => ({
  user: getUser(state),
  organization: getCurrentOrganization(state),
});

export default connect(
  mapState,
  null,
)(MembersPage);
null;

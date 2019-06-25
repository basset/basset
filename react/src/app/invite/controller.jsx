import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ApolloClient from '../../graphql/client.js';
import validateInviteQuery from '../../graphql/query/validateInvite.js';
import acceptInviteMutation from '../../graphql/mutate/acceptInvite.js';

import { login } from '../../redux/user/actions.js';

import Invite from './Invite.jsx';

export class InviteController extends React.PureComponent {
  static propTypes = {
    id: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    user: PropTypes.object,
  };

  state = {
    inviteAccepted: false,
    validInvite: true,
    graphQLError: '',
    requestError: '',
    isLoading: true,
    isRequesting: false,
    invite: {
      email: null,
    },
    user: {},
    nameError: '',
    passwordError: '',
    name: '',
    password: '',
  };

  async componentDidMount() {
    const { id, token } = this.props;
    let validInvite = false;
    let invite = {
      email: null,
    };
    let graphQLError = '';

    try {
      const { data } = await ApolloClient.query({
        query: validateInviteQuery,
        variables: {
          id,
          token,
        },
      });
      invite = data.validateInvite;
      validInvite = true;
    } catch (error) {
      if (
        error.graphQLErrors &&
        !error.graphQLErrors.some(e => e.message === 'Invalid Token')
      ) {
        validInvite = false;
      } else {
        graphQLError = error.toString();
      }
    }
    this.setState(state => ({
      ...state,
      invite,
      validInvite,
      graphQLError,
      isLoading: false,
    }));
  }

  handleSubmit = async () => {
    if (this.state.isRequesting) {
      return;
    }
    if (!this.isUserLoggedIn()) {
      let passwordError = '';
      let nameError = '';

      if (this.state.password.trim() === '') {
        passwordError = 'You must enter a password.';
      }

      if (this.state.name.trim() === '') {
        nameError = 'You must enter a name.';
      }

      if (nameError || passwordError) {
        this.setState(state => ({
          ...state,
          passwordError,
          nameError,
        }));
        return;
      }
    }
    this.setState(state => ({
      ...state,
      requestError: '',
      isRequesting: true,
    }));
    try {
      const { data } = await ApolloClient.mutate({
        mutation: acceptInviteMutation,
        variables: {
          id: this.props.id,
          token: this.props.token,
          name: this.state.name,
          password: this.state.password,
        },
      });
      const user = data.acceptInvite;
      const inviteAccepted = user.id !== null;

      this.setState(state => ({
        ...state,
        inviteAccepted,
        user,
        isRequesting: false,
        requestError: '',
      }));
    } catch (error) {
      this.setState(state => ({
        ...state,
        requestError: 'There was an error trying to accept this invite.',
        isRequesting: false,
      }));
    }
  };

  handleChangePassword = event => {
    const password = event.target.value;
    this.setState(state => ({
      ...state,
      password,
      passwordError: '',
    }));
  };

  handleChangeName = event => {
    const name = event.target.value;
    this.setState(state => ({
      ...state,
      name,
      nameError: '',
    }));
  };

  isUserLoggedIn = () => {
    const { user, isAuthenticated } = this.props;
    const { invite, inviteAccepted } = this.state;
    return (isAuthenticated && user.email === invite.email) || inviteAccepted;
  };

  render() {
    return (
      <Invite
        onAcceptInvite={() => this.props.onAcceptInvite(this.state.user)}
        redirect={`/invite/${this.props.id}/${this.props.token}`}
        isUserLoggedIn={this.isUserLoggedIn()}
        invite={this.state.invite}
        graphQLError={this.state.graphQLError}
        requestError={this.state.requestError}
        inviteAccepted={this.state.inviteAccepted}
        validInvite={this.state.validInvite}
        isLoading={this.state.isLoading}
        passwordError={this.state.passwordError}
        nameError={this.state.nameError}
        onSubmit={this.handleSubmit}
        onChangePassword={this.handleChangePassword}
        onChangeName={this.handleChangeName}
      />
    );
  }
}

const mapActions = dispatch => ({
  onAcceptInvite: user => dispatch(login(user)),
});

export default connect(
  null,
  mapActions,
)(InviteController);

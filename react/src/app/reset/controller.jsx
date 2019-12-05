import React from 'react';
import PropTypes from 'prop-types';

import ApolloClient from '../../graphql/client.js';
import resetPasswordMutation from '../../graphql/mutate/resetPassword.js';
import validResetPasswordQuery from '../../graphql/query/validResetPassword.js';

import ResetPage from './Reset.jsx';

export default class ResetController extends React.PureComponent {
  static propTypes = {
    id: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
  };
  state = {
    password: '',
    passwordError: '',
    resetSuccess: false,
    validToken: true,
    graphQLError: '',
    requestError: '',
    isLoading: true,
    isRequesting: false,
  };

  async componentDidMount() {
    const { id, token } = this.props;
    let validToken = false;
    let graphQLError = '';

    try {
      const { data } = await ApolloClient.query({
        query: validResetPasswordQuery,
        variables: {
          id,
          token,
        },
      });

      validToken = data.validResetPassword;
    } catch (error) {
      if (
        error.graphQLErrors &&
        error.graphQLErrors.some(e => (e.message = 'Invalid Token'))
      ) {
        validToken = false;
      } else {
        graphQLError =
          'There was an error trying to check if this password reset request is valid.';
      }
    }

    this.setState(state => ({
      ...state,
      validToken,
      graphQLError,
      isLoading: false,
    }));
  }

  handleResetPassword = async () => {
    this.setState(state => ({
      ...state,
      requestError: '',
      isRequesting: true,
    }));
    try {
      const { data } = await ApolloClient.mutate({
        mutation: resetPasswordMutation,
        variables: {
          id: this.props.id,
          token: this.props.token,
          password: this.state.password,
        },
      });
      const resetSuccess = data.resetPassword;

      this.setState(state => ({
        ...state,
        resetSuccess,
        isRequesting: false,
        requestError: '',
      }));
    } catch (error) {
      const passwordError = error.graphQLErrors && error.graphQLErrors.length > 0 ? error.graphQLErrors[0].message : error.message;
      this.setState(state => ({
        ...state,
        passwordError,
        requestError: 'There was an error trying to reset your password.',
        resetSuccess: false,
        isRequesting: false,
      }));
    }
  };

  handleSubmit = () => {
    if (this.state.isRequesting) {
      return;
    }
    let passwordError = '';
    if (this.state.password.trim() === '') {
      passwordError = 'You must enter a password';
    }
    if (passwordError) {
      this.setState(state => ({
        ...state,
        passwordError,
        requestError: '',
      }));
    } else {
      this.handleResetPassword();
    }
  };

  handleChangePassword = event => {
    const password = event.target.value;
    this.setState(state => ({
      ...state,
      password,
      passwordError: '',
      requestError: '',
    }));
  };

  render() {
    return (
      <ResetPage
        password={this.state.password}
        passwordError={this.state.passwordError}
        graphQLError={this.state.graphQLError}
        requestError={this.state.requestError}
        resetSuccess={this.state.resetSuccess}
        validToken={this.state.validToken}
        isLoading={this.state.isLoading}
        onChangePassword={this.handleChangePassword}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

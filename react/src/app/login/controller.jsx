import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ApolloClient from '../../graphql/client.js';
import loginMutation from '../../graphql/mutate/login.js';

import { login } from '../../redux/user/actions.js';

import LoginPage from './components/Login.jsx';

export class Login extends React.PureComponent {
  static propTypes = {
    onLogin: PropTypes.func.isRequired,
    redirect: PropTypes.string,
  };

  static defaultProps = {
    redirect: null,
  }

  state = {
    email: '',
    password: '',
    emailError: '',
    passwordError: '',
    isRequesting: false,
    error: '',
    requestError: '',
  };

  handleLoginAttempt = async () => {
    this.setState(state => ({
      ...state,
      isRequesting: true,
      error: '',
      requestError: '',
    }));
    const { email, password } = this.state;
    try {
      const { data } = await ApolloClient.mutate({
        mutation: loginMutation,
        variables: {
          email,
          password,
        },
      });
      if (data.login) {
        this.setState(state => ({
          ...state,
          isRequesting: false,
        }));
        this.props.onLogin(data.login, this.props.redirect);
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
          error: '',
          requestError: 'There was an error trying to login.',
        }));
      }
    }
  };

  handleSubmit = () => {
    if (this.state.isRequesting || this.state.error) {
      return;
    }

    let emailError = '';
    let passwordError = '';

    if (this.state.email.trim() === '') {
      emailError = 'You must enter an email.';
    }

    if (this.state.password.trim() === '') {
      passwordError = 'You must enter a password.';
    }

    if (emailError || passwordError) {
      this.setState(state => ({
        ...state,
        emailError,
        passwordError,
        error: '',
      }));
    } else {
      this.handleLoginAttempt();
    }
  };

  handleChangeEmail = event => {
    const email = event.target.value;
    this.setState(state => ({
      ...state,
      email,
      emailError: '',
      error: '',
    }));
  };

  handleChangePassword = event => {
    const password = event.target.value;
    this.setState(state => ({
      ...state,
      password,
      passwordError: '',
      error: '',
    }));
  };

  render() {
    return (
      <LoginPage
        redirect={this.props.redirect}
        error={this.state.error}
        requestError={this.state.requestError}
        email={this.state.email}
        emailError={this.state.emailError}
        password={this.state.password}
        passwordError={this.state.passwordError}
        onChangeEmail={this.handleChangeEmail}
        onChangePassword={this.handleChangePassword}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

const mapActions = dispatch => ({
  onLogin: (user, redirect) => dispatch(login(user, redirect)),
});

export default connect(
  null,
  mapActions,
)(Login);

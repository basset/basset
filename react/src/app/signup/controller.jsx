import React from 'react';

import SignUpPage from './SignUp.jsx';

import ApolloClient from '../../graphql/client.js';
import signUpMutation from '../../graphql/mutate/signUp.js';

export default class SignUp extends React.PureComponent {
  state = {
    name: '',
    email: '',
    password: '',
    emailError: '',
    nameError: '',
    passwordError: '',
    isRequesting: false,
    error: '',
    requestError: '',
    signupSuccess: false,
  };

  handleSignupAttempt = async () => {
    this.setState(state => ({
      ...state,
      isRequesting: true,
      error: '',
      requestError: '',
    }));
    const { email, password, name } = this.state;

    try {
      const { data } = await ApolloClient.mutate({
        mutation: signUpMutation,
        variables: {
          email,
          password,
          name,
        },
      });
      if (data.signUp) {
        this.setState(state => ({
          ...state,
          isRequesting: false,
          error: '',
          signupSuccess: true,
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
          error: '',
          requestError: 'There was an error trying to sign up.',
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
    let nameError = '';

    if (this.state.email.trim() === '') {
      emailError = 'You must enter an email.';
    }

    if (this.state.password.trim() === '') {
      passwordError = 'You must enter a password.';
    }

    if (this.state.name.trim() === '') {
      nameError = 'You must enter a name.';
    }

    if (emailError || passwordError || nameError) {
      this.setState(state => ({
        ...state,
        emailError,
        passwordError,
        nameError,
        error: '',
      }));
    } else {
      this.handleSignupAttempt();
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

  handleChangeName = event => {
    const name = event.target.value;
    this.setState(state => ({
      ...state,
      name,
      nameError: '',
      error: '',
    }));
  };

  render() {
    return (
      <SignUpPage
        signupSuccess={this.state.signupSuccess}
        error={this.state.error}
        requestError={this.state.requestError}
        email={this.state.email}
        emailError={this.state.emailError}
        password={this.state.password}
        passwordError={this.state.passwordError}
        name={this.state.name}
        nameError={this.state.nameError}
        onChangeEmail={this.handleChangeEmail}
        onChangePassword={this.handleChangePassword}
        onChangeName={this.handleChangeName}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

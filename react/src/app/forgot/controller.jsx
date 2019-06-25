import React from 'react';
import Forgot from './components/Forgot.jsx';

import ApolloClient from '../../graphql/client.js';
import forgotPasswordMutation from '../../graphql/mutate/forgotPassword.js';

export default class ForgotController extends React.PureComponent {
  state = {
    email: '',
    emailError: '',
    emailSent: false,
    hasError: false,
    isRequesting: false,
  };

  handleResetPassword = async () => {
    try {
      this.setState(state => ({
        ...state,
        isRequesting: true,
        hasError: false,
      }));
      const { data } = await ApolloClient.mutate({
        mutation: forgotPasswordMutation,
        variables: {
          email: this.state.email,
        },
      });
      if (data.forgotPassword) {
        this.setState(state => ({
          ...state,
          emailSent: true,
          isRequesting: false,
        }));
      }
    } catch (error) {
      console.error(error);
      this.setState(state => ({
        ...state,
        hasError: true,
        isRequesting: false,
      }));
    }
  };

  handleSubmit = () => {
    if (this.state.isRequesting) {
      return;
    }
    let emailError = '';
    if (this.state.email.trim() === '') {
      emailError = 'You must enter an email.';
    }
    if (emailError) {
      this.setState(state => ({
        ...state,
        emailError,
        hasError: false,
      }));
    } else {
      this.handleResetPassword();
    }
  };

  handleChangeEmail = event => {
    const email = event.target.value;
    this.setState(state => ({
      ...state,
      email,
      emailError: '',
      hasError: false,
    }));
  };

  render() {
    return (
      <Forgot
        email={this.state.email}
        emailError={this.state.emailError}
        emailSent={this.state.emailSent}
        hasError={this.state.hasError}
        onSubmit={this.handleSubmit}
        onChangeEmail={this.handleChangeEmail}
      />
    );
  }
}

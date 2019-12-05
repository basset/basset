import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ApolloClient from '../../graphql/client.js';
import changePasswordMutation from '../../graphql/mutate/changePassword.js';
import {
  getIsLoading,
  getUser,
  getError,
  getIsUpdating,
} from '../../redux/user/selectors.js';
import { saveUser } from '../../redux/user/actions.js';

import Profile from './Profile.jsx';
import Loader from '../../components/Loader/Loader.jsx';

export class ProfileController extends React.PureComponent {
  static propTypes = {
    user: PropTypes.object.isRequired,
    onSaveName: PropTypes.func.isRequired,
    isUpdating: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
  };

  state = {
    showChangePassword: false,
    password: '',
    changePasswordSuccess: false,
    isRequesting: false,
    passwordError: '',
    requestError: '',
    showPassword: false,
  };

  handleChangePassword = password => {
    this.setState(state => ({
      ...state,
      password,
    }));
  };
  handleShowPassword = () => {
    this.setState(state => ({
      ...state,
      showChangePassword: !state.showChangePassword,
      password: '',
      requestError: '',
      passwordError: '',
    }));
  };
  handleSavePassword = async () => {
    this.setState(state => ({
      ...state,
      requestError: '',
      isRequesting: true,
    }));
    try {
      const { data } = await ApolloClient.mutate({
        mutation: changePasswordMutation,
        variables: {
          password: this.state.password,
        },
      });
      const changePasswordSuccess = data.changePassword;

      this.setState(state => ({
        ...state,
        changePasswordSuccess,
        isRequesting: false,
        requestError: '',
        showChangePassword: false,
        password: '',
      }));
    } catch (error) {
      const passwordError = error.graphQLErrors && error.graphQLErrors.length > 0 ? error.graphQLErrors[0].message : error.message
      this.setState(state => ({
        ...state,
        passwordError,
        requestError: 'There was an error trying to change your password.',
        changePasswordSuccess: false,
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
      this.handleSavePassword();
    }
  };

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    return (
      <Profile
        user={this.props.user}
        error={this.props.error}
        isUpdating={this.props.isUpdating}
        isRequesting={this.state.isRequesting}
        onSaveName={this.props.onSaveName}
        onShowPassword={this.handleShowPassword}
        showChangePassword={this.state.showChangePassword}
        password={this.state.password}
        passwordError={this.state.passwordError}
        requestError={this.state.requestError}
        changePasswordSuccess={this.state.changePasswordSuccess}
        onChangePassword={this.handleChangePassword}
        onSavePassword={this.handleSubmit}
      />
    );
  }
}

const mapState = state => ({
  isLoading: getIsLoading(state),
  isUpdating: getIsUpdating(state),
  user: getUser(state),
  error: getError(state),
});

const mapActions = dispatch => ({
  onSaveName: name => dispatch(saveUser({ name })),
});

export default connect(
  mapState,
  mapActions,
)(ProfileController);

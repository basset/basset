import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ApolloClient from '../../../graphql/client.js';
import addOrganizationMutation from '../../../graphql/mutate/addOrganization.js';

import { addOrganization } from '../../../redux/organizations/actions.js';
import { goHome } from '../../../redux/router/actions.js';

import CreateOrganizationPage from './CreateOrganization.jsx';

export class CreateOrganization extends React.PureComponent {
  static propTypes = {
    onAddOrganization: PropTypes.func.isRequired,
  };

  state = {
    name: '',
    nameError: '',
    isRequesting: false,
    error: '',
    requestError: '',
  };

  handleAddOrganization = async () => {
    this.setState(state => ({
      ...state,
      isRequesting: true,
      error: '',
      requestError: '',
    }));
    const { name } = this.state;
    try {
      const { data } = await ApolloClient.mutate({
        mutation: addOrganizationMutation,
        variables: {
          name,
        },
      });
      if (data.createOrganization) {
        this.setState(state => ({
          ...state,
          isRequesting: false,
        }));
        this.props.onAddOrganization(data.createOrganization);
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
          requestError: 'There was an error trying to create an organization.',
        }));
      }
    }
  };

  handleSubmit = () => {
    if (this.state.isRequesting || this.state.error) {
      return;
    }

    let nameError = '';

    if (this.state.name.trim() === '') {
      nameError = 'You must enter a name.';
    }

    if (nameError) {
      this.setState(state => ({
        ...state,
        nameError,
        error: '',
      }));
    } else {
      this.handleAddOrganization();
    }
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
      <CreateOrganizationPage
        error={this.state.error}
        requestError={this.state.requestError}
        name={this.state.name}
        nameError={this.state.nameError}
        onChangeName={this.handleChangeName}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

const mapActions = dispatch => ({
  onAddOrganization: user => {
    dispatch(addOrganization(user));
    goHome();
  },
});

export default connect(
  null,
  mapActions,
)(CreateOrganization);

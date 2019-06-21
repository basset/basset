import React from 'react';

import ApolloClient from '../../graphql/client.js';
import activateMutation from '../../graphql/mutate/activate.js';

import Activate from './Activate.jsx';

export default class ActivateController extends React.PureComponent {
  state = {
    success: false,
    graphQLError: '',
    requestError: '',
    isLoading: true,
  };

  async componentDidMount() {
    const { id, token } = this.props;
    let requestError = '';
    let success = false;
    try {
      const { data } = await ApolloClient.mutate({
        mutation: activateMutation,
        variables: {
          id,
          token,
        },
      });
      success = data.activate !== null;
    } catch (error) {
      if (
        error.graphQLErrors &&
        !error.graphQLErrors.some(e => (e.message = 'Invalid Token'))
      ) {
        requestError =
          'There was an error trying to check if this password reset request is valid.';
      }
    }
    this.setState({
      success,
      requestError,
      isLoading: false,
    });
  }

  render() {
    return (
      <Activate
        success={this.state.success}
        requestError={this.state.requestError}
        isLoading={this.state.isLoading}
      />
    );
  }
}

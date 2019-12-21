import React from 'react';
import { connect } from 'react-redux';

import ApolloClient from '../../graphql/client.js';
import SnapshotsQuery from '../../graphql/query/getSnapshots.js';
import { getIsLoading, getCurrentBuild } from '../../redux/builds/selectors.js';
import { changeBuild } from '../../redux/builds/actions.js';

import Loader from '../../components/Loader/Loader.jsx';
import { goLogin } from '../../redux/router/actions.js';
import { getUser } from '../../redux/user/selectors.js';

import Snapshots from '../snapshots/components/Snapshots.jsx';

export class Controller extends React.PureComponent {
  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    if (!this.props.build && !this.props.user.id) {
      goLogin();
      return null;
    }
    if (!this.props.build) {
      return null;
    }
    return (
      <React.Fragment>
        <Snapshots />
      </React.Fragment>
    );
  }
}

const mapState = state => ({
  isLoading: getIsLoading(state),
  build: getCurrentBuild(state),
  user: getUser(state),
});

const mapAction = dispatch => ({
  onChangeBuild: build => dispatch(changeBuild(build)),
});

export default connect(
  mapState,
  mapAction,
)(Controller);

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  getIsLoading,
  getCurrentProject,
  getError,
  getIsUpdating,
} from '../../../redux/projects/selectors.js';
import { getBuilds } from '../../../redux/builds/selectors.js';
import { getUser } from '../../../redux/user/selectors.js';
import { saveProject } from '../../../redux/projects/actions.js';
import { startPolling, stopPolling } from '../../../redux/builds/actions';
import { getCurrentOrganization } from '../../../redux/organizations/selectors.js';

import Project from './Project.jsx';
import Loader from '../../../components/Loader/Loader.jsx';

export class ProjectController extends React.Component {
  static propTypes = {
    buildCount: PropTypes.number.isRequired,
    project: PropTypes.object,
    user: PropTypes.object,
    error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    organization: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    startPolling: PropTypes.func.isRequired,
    stopPolling: PropTypes.func.isRequired,
  };

  static defaultProps = {
    project: null,
  };

  componentDidMount() {
    this.props.startPolling();
  }

  componentWillUnmount() {
    this.props.stopPolling();
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    if (!this.props.project) {
      return null;
    }
    return (
      <Project
        buildCount={this.props.buildCount}
        isUpdating={this.props.isUpdating}
        isLoading={this.props.isLoading}
        project={this.props.project}
        user={this.props.user}
        error={this.props.error}
        organization={this.props.organization}
        onSave={this.props.onSave}
      />
    );
  }
}

const mapState = state => ({
  isLoading: getIsLoading(state),
  isUpdating: getIsUpdating(state),
  user: getUser(state),
  organization: getCurrentOrganization(state),
  buildCount: getBuilds(state).length,
  project: getCurrentProject(state),
  error: getError(state),
});

const mapActions = dispatch => ({
  onSave: (item, value) => dispatch(saveProject({ [item]: value })),
  startPolling: () => dispatch(startPolling()),
  stopPolling: () => dispatch(stopPolling()),
});

export default connect(
  mapState,
  mapActions,
)(ProjectController);

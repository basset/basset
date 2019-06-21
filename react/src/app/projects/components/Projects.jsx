import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box, Text } from 'grommet';

import {
  getProjects,
  getIsLoading,
  getCurrentProject,
  getHasNextPage,
  getIsLoadingMore,
} from '../../../redux/projects/selectors.js';
import { getCurrentOrganization } from '../../../redux/organizations/selectors.js';
import { changeProject, loadMore } from '../../../redux/projects/actions.js';

import LoadMoreButton from '../../../components/LoadMoreButton/LoadMoreButton.jsx';
import Link from '../../../components/Link/Link.jsx';
import Loader from '../../../components/Loader/Loader.jsx';

export class Projects extends React.PureComponent {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    isLoadingMore: PropTypes.bool.isRequired,
    projects: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }).isRequired,
    ).isRequired,
    selectedProject: PropTypes.object,
    organization: PropTypes.object,
    hasMoreProjects: PropTypes.bool.isRequired,
    onChangeProject: PropTypes.func.isRequired,
  };

  static defaultProps = {
    selectedProject: null,
  };

  get hasProjects() {
    return this.props.projects.length > 0;
  }

  createProjectButton = (
    <Link.Button
      data-test-id="create-project"
      alignSelf="center"
      href="/projects/create"
      label="Create a project"
    />
  );

  renderCreateProject = () => {
    const isAdmin = this.props.organization.admin;
    const boxProps = {
      margin: {
        bottom: 'medium',
      },
    };
    if (this.hasProjects && !isAdmin) {
      return (
        <Box {...boxProps} align="center">
          <Text size="small">Projects</Text>
        </Box>
      );
    }

    if (!this.hasProjects) {
      boxProps.gap = 'large';
      const name = this.props.organization
        ? `${this.props.organization.name} does`
        : 'You do';
      return (
        <Box {...boxProps}>
          <Text>{name} not have any projects setup</Text>
          <Text>
            Before you can submit builds, you must have at least one project
            setup.
          </Text>
          {isAdmin && this.createProjectButton}
          {!isAdmin && (
            <Text>
              Only admins can setup projects. Please talk to your admin about
              getting a project created.
            </Text>
          )}
        </Box>
      );
    }
    return <Box {...boxProps}>{this.createProjectButton}</Box>;
  };

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    return (
      <Box fill flex margin="none">
        {this.renderCreateProject()}
        <Box justify="center">
          {this.props.projects.map(project => (
            <Link.Button
              data-test-id="project"
              color="dark-1"
              href={`/projects/${project.id}`}
              onClick={() => this.props.onChangeProject(project)}
              key={project.id}
              hoverIndicator="background"
              active={
                this.props.selectedProject &&
                this.props.selectedProject.id === project.id
              }
            >
              <Box
                key={project.id}
                pad="small"
                border={{
                  side: 'bottom',
                  color: 'light-4',
                }}
              >
                <Text>{project.name}</Text>
              </Box>
            </Link.Button>
          ))}
          {this.props.hasMoreProjects && (
            <Box margin="small" align="center">
              <LoadMoreButton
                isLoadingMore={this.props.isLoadingMore}
                onLoadMore={this.props.onLoadMore}
              />
            </Box>
          )}
        </Box>
      </Box>
    );
  }
}

const mapState = state => ({
  isLoading: getIsLoading(state),
  isLoadingMore: getIsLoadingMore(state),
  projects: getProjects(state),
  hasMoreProjects: getHasNextPage(state),
  selectedProject: getCurrentProject(state),
  organization: getCurrentOrganization(state),
});

const mapAction = dispatch => ({
  onChangeProject: project => dispatch(changeProject(project)),
  onLoadMore: () => dispatch(loadMore()),
});

export default connect(
  mapState,
  mapAction,
)(Projects);

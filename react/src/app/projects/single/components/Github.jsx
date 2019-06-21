import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Box,
  Text,
  Button,
  Form,
  TextInput,
  CheckBox,
  Layer,
  Heading,
} from 'grommet';
import { Edit, Github, FormClose, FormCheckmark, Trash } from 'grommet-icons';

import {
  getIsUpdating,
  getCurrentProject,
} from '../../../../redux/projects/selectors.js';
import { getUser } from '../../../../redux/user/selectors.js';
import { getCurrentOrganization } from '../../../../redux/organizations/selectors.js';
import {
  saveProject,
  removeGithub,
  linkToGitHub,
} from '../../../../redux/projects/actions.js';
import InlineField from '../../../../components/InlineField/InlineField.jsx';

export class GithubIntegration extends React.PureComponent {
  static propTypes = {
    user: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
    isUpdating: PropTypes.bool.isRequired,
    onLinkToGitHub: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onToggleRepoActive: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  };

  state = {
    showDelete: false,
  };

  handleChangeRepoActive = event => {
    const toggle = event.target.checked;
    this.props.onToggleRepoActive(toggle);
  };

  handleDeleteIntegration = () => {
    this.setState(state => ({
      ...state,
      showDelete: true,
    }));
  };

  handleCancelDelete = () => {
    this.setState(state => ({
      ...state,
      showDelete: false,
    }));
  };

  handleDeleteConfirm = () => {
    this.props.onDelete();
    this.setState(state => ({
      ...state,
      showDelete: false,
    }));
  };

  getIcon = {
    github: <Github />,
  };

  renderGithub() {
    const icon = this.getIcon[this.props.project.provider];
    let children = null;
    if (this.props.organization.admin) {
      children = (
        <Button
          data-test-id="remove-github"
          disabled={this.props.isUpdating}
          onClick={this.handleDeleteIntegration}
        >
          <Trash color="status-critical" />
        </Button>
      );
    }
    return (
      <Box direction="row" justify="between" align="center">
        <Heading level={5}>Source control management</Heading>
        <Box direction="row" justify="center" gap="small">
          {icon}
          <Text weight="bold">{this.props.project.provider}</Text>
          {children}
        </Box>
      </Box>
    );
  }

  render() {
    const hasGithub = this.props.user.providers.some(
      p => p.provider === 'github',
    );
    if (
      !hasGithub &&
      !this.props.project.hasToken &&
      this.props.organization.admin
    ) {
      return (
        <Box width="large" gap="medium">
          <Text>
            To integrate with github you need to login with your github account.
          </Text>
          <Box align="start">
            <Button
              data-test-id="setup-github"
              label="Login with github"
              disabled={this.props.isUpdating}
              onClick={this.props.onLinkToGitHub}
            />
          </Box>
        </Box>
      );
    }
    if (!this.props.project.hasToken) {
      return (
        <Box gap="medium">
          <Text>Integrate this project with github.</Text>
          <Box align="start">
            <Button
              label="Use my github account for this project"
              data-test-id="use-github"
              disabled={this.props.isUpdating}
              onClick={this.props.onLinkToGitHub}
              primary
            />
          </Box>
        </Box>
      );
    }

    return (
      <React.Fragment>
        {this.renderGithub()}
        <InlineField
          testId="repo-owner"
          title="Repo owner"
          canChange={this.props.organization.admin}
          value={this.props.project.repoOwner}
          onSubmit={value => this.props.onSave('repoOwner', value)}
          isUpdating={this.props.isUpdating}
        />
        <InlineField
          testId="repo-name"
          title="Repo name"
          canChange={this.props.organization.admin}
          value={this.props.project.repoName}
          onSubmit={value => this.props.onSave('repoName', value)}
          isUpdating={this.props.isUpdating}
        />
        <Box margin={{ vertical: 'small' }} direction="row" justify="between">
          <Text>Active</Text>
          <CheckBox
            data-test-id="toggle-repo-active"
            checked={this.props.project.repoActive || false}
            onChange={this.handleChangeRepoActive}
            disabled={this.props.isUpdating || !this.props.organization.admin}
            reverse
            toggle
          />
        </Box>
        {this.state.showDelete && (
          <Layer position="center" onClickOutside={this.handleCancelDelete}>
            <Box pad="medium" gap="large" width="medium">
              <Text>Delete this github integration?</Text>
              <Box direction="row" gap="medium" align="center" justify="end">
                <Button
                  data-test-id="confirm-remove-github"
                  label="Yes"
                  onClick={this.handleDeleteConfirm}
                />
                <Button
                  data-test-id="cancel-remove-github"
                  label="No"
                  primary
                  onClick={this.handleCancelDelete}
                />
              </Box>
            </Box>
          </Layer>
        )}
      </React.Fragment>
    );
  }
}

const mapState = state => ({
  isUpdating: getIsUpdating(state),
  user: getUser(state),
  organization: getCurrentOrganization(state),
  project: getCurrentProject(state),
});

const mapActions = dispatch => ({
  onLinkToGitHub: () => dispatch(linkToGitHub()),
  onSave: (item, value) => dispatch(saveProject({ [item]: value })),
  onToggleRepoActive: repoActive => dispatch(saveProject({ repoActive })),
  onDelete: () => dispatch(removeGithub()),
});

export default connect(
  mapState,
  mapActions,
)(GithubIntegration);

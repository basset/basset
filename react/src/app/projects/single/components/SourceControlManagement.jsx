import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Box,
  Text,
  Button,
  Select,
  TextInput,
  CheckBox,
  Layer,
  Heading,
} from 'grommet';
import { Edit } from 'grommet-icons';

import {
  getIsUpdating,
  getCurrentProject,
} from '../../../../redux/projects/selectors.js';
import { getUser } from '../../../../redux/user/selectors.js';
import { getCurrentOrganization } from '../../../../redux/organizations/selectors.js';
import {
  saveProject,
  removeCurrentProvider,
  linkToProvider,
} from '../../../../redux/projects/actions.js';


export class GithubIntegration extends React.PureComponent {
  static propTypes = {
    user: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
    isUpdating: PropTypes.bool.isRequired,
    onLinkToProvider: PropTypes.func.isRequired,
    onToggleSCMActive: PropTypes.func.isRequired,
  };

  state = {
    showDelete: false,
    provider: this.props.project.scmProvider,
    isEditing: false,
    scmConfig: this.props.project.scmConfig || {
      repoName: '',
      repoOwner: '',
      repoSlug: '',
      projectId: '',
      username: '',
    },
  };

  handleChangeSCMConfigValue = (name, value) => {
    this.setState(state => ({
      ...state,
      scmConfig: {
        ...state.scmConfig,
        [name]: value,
      },
    }));
  };

  handleChangeRepoActive = event => {
    const toggle = event.target.checked;
    this.props.onToggleSCMActive(toggle);
  };

  handleToggleEdit = () => {
    this.setState(state => ({
      isEditing: !state.isEditing,
    }))
  };

  handleChangeProvider = (option) => {
    this.setState(() => ({
      provider: option.value,
    }))
  };

  handleLinkProvider = () => {
    this.props.onLinkToProvider(this.state.provider);
  };

  handleSave = async () => {
    if (this.state.provider === 'None') {
      this.props.onRemoveCurrentProvider();
    } else {
      const scmConfig = {};
      if (this.state.provider === 'github') {
        scmConfig.repoName = this.state.scmConfig.repoName;
        scmConfig.repoOwner = this.state.scmConfig.repoOwner;
      }
      if (this.state.provider === 'gitlab') {
        scmConfig.projectId = this.state.scmConfig.projectId;
      }
      if (this.state.provider === 'bitbucket') {
        scmConfig.repoSlug = this.state.scmConfig.repoSlug;
        scmConfig.username = this.state.scmConfig.username;
      }
      const usingProvider = this.props.project.hasToken && this.props.project.scmProvider === this.state.provider;
      if (!usingProvider) {
        await this.props.onLinkToProvider(this.state.provider);
      }
      this.props.onSave({
        scmProvider: this.state.provider,
        scmConfig,
      });
    }

    this.setState(state => ({
      isEditing: false,
    }));
  };

  renderIntegrationButton() {
    const { provider } = this.state;
    if (!provider) {
      return null;
    }
    const hasProvider = this.props.user.providers.some(
      p => p.provider === provider,
    );

    if (provider !== 'None' && !hasProvider && this.props.organization.admin) {
      return (
        <Box margin={{ vertical: 'small' }} justify="between" direction="row" align="center">
          <Text>
            To integrate with {provider} you need to login with your {provider} account:
          </Text>
          <Box align="start">
            <Button
              data-test-id="setup-scm"
              label={`Login with ${provider}`}
              disabled={this.props.isUpdating}
              onClick={this.handleLinkProvider}
            />
          </Box>
        </Box>
      );
    }
    let render;
    if (this.state.provider === 'github') {
      render = this.renderGitHubConfig();
    }
    if (this.state.provider === 'gitlab') {
      render = this.renderGitLabConfig();
    }
    if (this.state.provider === 'bitbucket') {
      render = this.renderBitbucketConfig();
    }
    return (
      <React.Fragment>
        {render}
        <Box direction="row" justify="end" align="center">
          <Button
            onClick={this.handleSave}
            label="Save"
          />
        </Box>
      </React.Fragment>
    )
  }

  renderGitLabConfig() {
    return (
      <React.Fragment>
        <Box margin={{ vertical: 'small' }} direction="row" justify="between" align="center">
          <Text>Project Id</Text>
          <Box width="medium">
            <TextInput
              data-test-id="project-id-input"
              value={this.state.scmConfig.projectId}
              onChange={event => this.handleChangeSCMConfigValue('projectId', event.target.value)}
            />
          </Box>
        </Box>
      </React.Fragment>
    );
  }

  renderBitbucketConfig() {
    return (
      <React.Fragment>
        <Box margin={{ vertical: 'small' }} direction="row" justify="between" align="center">
          <Text>Repo Slug</Text>
          <Box width="medium">
            <TextInput
              data-test-id="repo-slug-input"
              value={this.state.scmConfig.repoSlug}
              onChange={event => this.handleChangeSCMConfigValue('repoSlug', event.target.value)}
            />
          </Box>
        </Box>
        <Box margin={{ vertical: 'small' }} direction="row" justify="between" align="center">
          <Text>Username</Text>
          <Box width="medium">
            <TextInput
              data-test-id="username-input"
              value={this.state.scmConfig.username}
              onChange={event => this.handleChangeSCMConfigValue('username', event.target.value)}
            />
          </Box>
        </Box>
      </React.Fragment>
    );
  }

  renderGitHubConfig() {
    return (
      <React.Fragment>
        <Box margin={{ vertical: 'small' }} direction="row" justify="between" align="center">
          <Text>Repo Owner</Text>
          <Box width="medium">
            <TextInput
              data-test-id="repo-owner-input"
              value={this.state.scmConfig.repoOwner}
              onChange={event => this.handleChangeSCMConfigValue('repoName', event.target.value)}
            />
          </Box>
        </Box>
        <Box margin={{ vertical: 'small' }} direction="row" justify="between" align="center">
          <Text>Repo Name</Text>
          <Box width="medium">
            <TextInput
              data-test-id="repo-name-input"
              value={this.state.scmConfig.repoName}
              onChange={event => this.handleChangeSCMConfigValue('repoName', event.target.value)}
            />
          </Box>
        </Box>
      </React.Fragment>
    );
  }

  render() {
    const loginOptions =  [
      'None',
      ...Object.entries(__BASSET__.logins).filter(([, value]) => value).map(([name,]) => name)
    ];
    return (
      <React.Fragment>
        <Heading level={5}>Source control management</Heading>
        <Box margin={{ vertical: 'small' }} direction="row" justify="between" align="center">
          <Text>Active</Text>
          <CheckBox
            data-test-id="toggle-scm-active"
            checked={this.props.project.scmActive || false}
            onChange={this.handleChangeRepoActive}
            disabled={this.props.isUpdating || !this.props.organization.admin}
            reverse
            toggle
          />
        </Box>
        <Box margin={{ vertical: 'small' }} direction="row" justify="between" align="center">
          <Text>Provider</Text>
          {this.state.isEditing ? (
            <Select
              value={this.state.provider}
              onChange={this.handleChangeProvider}
              options={loginOptions}
            />
          ) : (
            <React.Fragment>
            <Button
              data-test-id="edit-scm-provider"
              onClick={this.handleToggleEdit}
              disabled={this.props.isUpdating}
            >
              <Box direction="row" gap="small" align="center">
                <Text>{this.props.project.scmProvider}</Text>
              <Edit color="brand" />
              </Box>
            </Button>
            </React.Fragment>
          )}
        </Box>
        {this.state.isEditing && this.renderIntegrationButton()}
      </React.Fragment>
    )
  }
}

const mapState = state => ({
  isUpdating: getIsUpdating(state),
  user: getUser(state),
  organization: getCurrentOrganization(state),
  project: getCurrentProject(state),
});

const mapActions = dispatch => ({
  onLinkToProvider: (provider) => dispatch(linkToProvider(provider)),
  onSave: (data) => dispatch(saveProject(data)),
  onToggleSCMActive: scmActive => dispatch(saveProject({ scmActive })),
  onRemoveCurrentProvider: () => dispatch(removeCurrentProvider())
});

export default connect(
  mapState,
  mapActions,
)(GithubIntegration);

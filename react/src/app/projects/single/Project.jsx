import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Tabs, Tab, Heading, CheckBox } from 'grommet';
import { UserAdmin, Firefox, Chrome } from 'grommet-icons';

import Builds from '../../builds/components/Builds.jsx';
import Integration from './components/Integration.jsx';
import Notification from '../../../components/Notification/Notification.jsx';
import InlineField from '../../../components/InlineField/InlineField.jsx';
import Loader from '../../../components/Loader/Loader.jsx';

export class Project extends React.PureComponent {
  static propTypes = {
    buildCount: PropTypes.number.isRequired,
    project: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    isUpdating: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
  };

  renderError = error => (
    <Notification
      type="error"
      error={error}
      message={`There was an error trying to update this project`}
    />
  );

  hasBrowser = browser => {
    return this.props.project.browsers.split(',').includes(browser);
  };

  handleToggleBrowser = browser => () => {
    let browsers = this.props.project.browsers.split(',');
    if (this.hasBrowser(browser)) {
      browsers = browsers.filter(b => b !== browser);
    } else {
      browsers = [...browsers, browser];
    }
    if (browsers.length > 0) {
      this.props.onSave('browsers', browsers.join(','));
    }
  };

  render() {
    const isUser = !!this.props.user.id;
    const isAdmin = (this.props.organization && this.props.organization.admin) || false;
    if (this.props.isLoading) {
      return <Loader />;
    }
    return (
      <Box width="xlarge">
        <Tabs flex>
          <Tab data-test-id="project-builds" title="Builds">
            <Box pad="small">
              <Builds />
            </Box>
          </Tab>
          {isUser && (
            <Tab data-test-id="project-configuration" title="Configuration">
              {this.props.error && this.renderError(this.props.error)}
              <Box pad="medium" fill="horizontal">
                {!isAdmin && (
                  <Box
                    pad="medium"
                    background="light-1"
                    direction="row"
                    gap="small"
                  >
                    <UserAdmin color="status-warning" />
                    <Text color="status-warning">
                      Only admins can edit these settings.
                    </Text>
                  </Box>
                )}
                <Heading level={3}>Project details</Heading>
                <InlineField
                  testId="project-name"
                  canChange={isAdmin}
                  title="Project name"
                  value={this.props.project.name}
                  onSubmit={value => this.props.onSave('name', value)}
                  isUpdating={this.props.isUpdating}
                />
                <InlineField
                  testId="project-branch"
                  canChange={isAdmin}
                  title="Default branch"
                  value={this.props.project.defaultBranch}
                  onSubmit={value => this.props.onSave('defaultBranch', value)}
                  isUpdating={this.props.isUpdating}
                />
                <InlineField
                  testId="project-widths"
                  canChange={isAdmin}
                  title="Default widths (comma separated)"
                  value={this.props.project.defaultWidth}
                  onSubmit={value => this.props.onSave('defaultWidth', value)}
                  isUpdating={this.props.isUpdating}
                />
                <InlineField
                  testId="project-hide-selectors"
                  canChange={isAdmin}
                  title="Default hide selectors (comma separated)"
                  value={this.props.project.hideSelectors}
                  onSubmit={value => this.props.onSave('hideSelectors', value)}
                  isUpdating={this.props.isUpdating}
                />
                <Box
                  margin={{ vertical: 'small' }}
                  direction="row"
                  justify="between"
                >
                  <Text>Api key</Text>
                  <Text>{this.props.project.key}</Text>
                </Box>
                {this.props.organization.allowPublicProjects && (
                  <Box fill="horizontal">
                    <Heading level={5}>
                      Privacy settings
                    </Heading>
                    <Box
                      margin={{ vertical: 'small' }}
                      direction="row"
                      justify="between"
                    >
                      <Box direction="row" align="center" gap="small">
                        Allow public to view builds and snapshots
                      </Box>
                      <CheckBox
                        data-test-id="toggle-public"
                        checked={this.props.project.public}
                        onChange={() => this.props.onSave('public', !this.props.project.public)}
                        disabled={
                          this.props.isUpdating || !isAdmin
                        }
                        reverse
                        toggle
                      />
                    </Box>
                  </Box>
                )}
                <Box fill="horizontal">
                  <Heading level={5}>
                    Default browsers (at least one required)
                  </Heading>
                  <Box
                    margin={{ vertical: 'small' }}
                    direction="row"
                    justify="between"
                  >
                    <Box direction="row" align="center" gap="small">
                      <Firefox color="plain" /> Firefox
                    </Box>
                    <CheckBox
                      data-test-id="toggle-firefox"
                      checked={this.hasBrowser('firefox')}
                      onChange={this.handleToggleBrowser('firefox')}
                      disabled={
                        this.props.isUpdating || !isAdmin
                      }
                      reverse
                      toggle
                    />
                  </Box>
                  <Box
                    margin={{ vertical: 'small' }}
                    direction="row"
                    justify="between"
                    align="center"
                  >
                    <Box direction="row" align="center" gap="small">
                      <Chrome color="plain" /> Chrome
                    </Box>
                    <CheckBox
                      data-test-id="toggle-chrome"
                      checked={this.hasBrowser('chrome')}
                      onChange={this.handleToggleBrowser('chrome')}
                      disabled={
                        this.props.isUpdating || !isAdmin
                      }
                      reverse
                      toggle
                    />
                  </Box>
                </Box>
                <Integration />
              </Box>
            </Tab>
          )}
        </Tabs>
      </Box>
    );
  }
}

export default Project;

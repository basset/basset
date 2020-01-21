import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Tabs, Tab, Heading, CheckBox } from 'grommet';
import { UserAdmin, Firefox, Chrome } from 'grommet-icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

import Builds from '../../builds/components/Builds.jsx';
import Integration from './components/Integration.jsx';
import Notification from '../../../components/Notification/Notification.jsx';
import InlineField from '../../../components/InlineField/InlineField.jsx';
import Loader from '../../../components/Loader/Loader.jsx';

function nodeCode(key) {
  return `// npm install @getbasset/node-client
const Basset = require('@getbasset/node-client');

const BASSET_TOKEN = '${key}'; // project API key
const BASSET_URL = '${window.__BASSET__.site}'
const BASSET_ASSETS = 'static';

const basset = new Basset(BASSET_TOKEN, BASSET_ASSETS, BASSET_URL, {
  baseUrl: 'assets',
  ignoreExtensions: '.js,.map',
});

await basset.buildStart(); // initialize build and submit assets

const snapshot = {
  title: 'test_snapshot',
  width: '1280',
  browser: 'chrome',
  hideSelectors: null,
  selectors: null,
};
await basset.uploadSnapshotFile(snapshot, 'path/to/snapshot.html');

await basset.buildFinish();
`;
}

function pythonCode(key) {
  return `# pip install basset-python-client
from basset_client.basset import Basset

BASSET_TOKEN = '${key}' # project API key
BASSET_URL = '${window.__BASSET__.site}'
BASSET_ASSETS = 'static'

basset = Basset(BASSET_TOKEN, BASSET_ASSETS, BASSET_URL, 'assets')

basset.build_start() # initialize build and submit assets
snapshot = [
    '1280', # widths
    'test snapshot', # title
    'firefox', # browser
    '', # hide_selectors
    '', # selectors
]
basset.upload_snapshot_file(snapshot, 'path_to/snapshot.html')
basset.build_finish()
`;
}

export class Project extends React.PureComponent {
  static propTypes = {
    buildCount: PropTypes.number.isRequired,
    project: PropTypes.object.isRequired,
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
          <Tab data-test-id="project-configuration" title="Configuration">
            {this.props.error && this.renderError(this.props.error)}
            <Box pad="medium" fill="horizontal">
              {!this.props.organization.admin && (
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
                canChange={this.props.organization.admin}
                title="Project name"
                value={this.props.project.name}
                onSubmit={value => this.props.onSave('name', value)}
                isUpdating={this.props.isUpdating}
              />
              <InlineField
                testId="project-branch"
                canChange={this.props.organization.admin}
                title="Default branch"
                value={this.props.project.defaultBranch}
                onSubmit={value => this.props.onSave('defaultBranch', value)}
                isUpdating={this.props.isUpdating}
              />
              <InlineField
                testId="project-widths"
                canChange={this.props.organization.admin}
                title="Default widths (comma separated)"
                value={this.props.project.defaultWidth}
                onSubmit={value => this.props.onSave('defaultWidth', value)}
                isUpdating={this.props.isUpdating}
              />
              <InlineField
                testId="project-hide-selectors"
                canChange={this.props.organization.admin}
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
                      this.props.isUpdating || !this.props.organization.admin
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
                      this.props.isUpdating || !this.props.organization.admin
                    }
                    reverse
                    toggle
                  />
                </Box>
              </Box>
              <Integration />
            </Box>
          </Tab>
          <Tab data-test-id="project-setup" title="Setup">
            <Box margin={{top: 'medium'}} align="center">
              <Text>Basset currently has library support for Node and Python. To submit snapshots to Basset with other languages please see the API documentation here</Text>
              <Text margin={{top: 'small'}}>Below are snippets for the included libraries. For testing frameworks which run in parallel the suggestion is to save snapshots (HTML source) into a temporary folder and then upload snapshots once all tests have completed</Text>
              <Box width="xlarge">
                <Tabs margin={{top: 'medium'}} justify="start">
                  <Tab data-test-id="node-setup" title="Node">
                    <SyntaxHighlighter language="javascript" style={docco}>
                      {nodeCode(this.props.project.key)}
                    </SyntaxHighlighter>
                  </Tab>
                  <Tab data-test-id="python-setup" title="Python">
                    <SyntaxHighlighter language="python" style={docco}>
                      {pythonCode(this.props.project.key)}
                    </SyntaxHighlighter>
                  </Tab>
                </Tabs>
              </Box>
            </Box>
          </Tab>
        </Tabs>
      </Box>
    );
  }
}

export default Project;

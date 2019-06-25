import React from 'react';
import { Box, Heading } from 'grommet';

import GithubIntegration from './Github.jsx';
import SlackIntegration from './Slack.jsx';

export class Integration extends React.PureComponent {
  render() {
    return (
      <React.Fragment>
        <Heading level={3}>Integrations</Heading>
        <GithubIntegration />
        <SlackIntegration />
      </React.Fragment>
    );
  }
}

export default Integration;

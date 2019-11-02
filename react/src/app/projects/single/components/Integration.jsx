import React from 'react';
import { Heading } from 'grommet';

import SlackIntegration from './Slack.jsx';
import SourceControlManagement from './SourceControlManagement.jsx';

export class Integration extends React.PureComponent {
  render() {
    return (
      <React.Fragment>
        <Heading level={3}>Integrations</Heading>
        <SourceControlManagement />
        <SlackIntegration />
      </React.Fragment>
    );
  }
}

export default Integration;

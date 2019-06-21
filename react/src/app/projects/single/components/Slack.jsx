import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Box, Text, Button, TextInput, Form, CheckBox, Heading } from 'grommet';
import { Edit, Slack, FormClose, FormCheckmark } from 'grommet-icons';

import {
  getIsUpdating,
  getCurrentProject,
} from '../../../../redux/projects/selectors.js';
import { getUser } from '../../../../redux/user/selectors.js';
import { getCurrentOrganization } from '../../../../redux/organizations/selectors.js';
import { saveProject } from '../../../../redux/projects/actions.js';
import InlineField from '../../../../components/InlineField/InlineField.jsx';

const TruncateButton = styled(Button)`
  min-width: 0;
`;
const TruncateText = styled(Text)`
  width: 100%;
`;

export class SlackIntegration extends React.PureComponent {
  static propTypes = {
    user: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
    isUpdating: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    onToggleSlackActive: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  };

  handleChangeSlackActive = event => {
    const toggle = event.target.checked;
    this.props.onToggleSlackActive(toggle);
  };

  getIcon = {
    Slack: <Slack />,
  };

  render() {
    return (
      <React.Fragment>
        <Heading level={5}>Slack</Heading>
        <InlineField
          testId="slack-webhook"
          canChange={this.props.organization.admin}
          title="Webhook"
          value={this.props.project.slackWebhook}
          onSubmit={value => this.props.onSave('slackWebhook', value)}
          isUpdating={this.props.isUpdating}
        />
        <InlineField
          testId="slack-variable"
          canChange={this.props.organization.admin}
          title="Mention variable"
          value={this.props.project.slackVariable}
          onSubmit={value => this.props.onSave('slackVariable', value)}
          isUpdating={this.props.isUpdating}
        />
        <Box margin={{ vertical: 'small' }} direction="row" justify="between">
          <Text>Active</Text>
          <CheckBox
            checked={this.props.project.slackActive || false}
            onChange={this.handleChangeSlackActive}
            disabled={this.props.isUpdating || !this.props.organization.admin}
            reverse
            toggle
          />
        </Box>
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
  onLinkToSlack: () => dispatch(linkToSlack()),
  onSave: (item, value) => dispatch(saveProject({ [item]: value })),
  onToggleSlackActive: slackActive => dispatch(saveProject({ slackActive })),
  onDelete: () => dispatch(removeSlack()),
});

export default connect(
  mapState,
  mapActions,
)(SlackIntegration);

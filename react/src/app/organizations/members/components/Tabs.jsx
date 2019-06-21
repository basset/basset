import React from 'react';
import {
  Tabs,
  Tab,
  Box,
  Heading,
  Button,
  Layer,
  Text,
  FormField,
  TextInput,
} from 'grommet';
import { Alert } from 'grommet-icons';
import Invites from '../invite-controller.jsx';
import Members from '../members-controller.jsx';

const OrganizationTabs = React.memo(
  ({
    organization,
    onCancelInvite,
    onConfirmInvite,
    error,
    email,
    onChangeEmail,
    isRequesting,
    onInvite,
    onChangeTab,
    activeTab,
    showInviteMemberDialog,
    invite,
  }) => {
    if (!organization) {
      return null;
    }
    let children = null;
    if (showInviteMemberDialog) {
      children = (
        <Layer position="center" onClickOutside={onCancelInvite}>
          <Box data-test-id="invite-member-dialog" pad="large" gap="medium">
            <Text>Enter the email of the person you want to invite</Text>
            {error && (
              <Box width="medium" direction="row" align="center" gap="small">
                <Alert color="status-critical" />
                <Text data-test-id="invite-error" color="status-critical">
                  {error}
                </Text>
              </Box>
            )}
            <Box>
              <FormField label="Email">
                <TextInput
                  data-test-id="invite-email-input"
                  placeholder="user@basset.io"
                  value={email}
                  onChange={onChangeEmail}
                  name="email"
                  type="email"
                />
              </FormField>
            </Box>
            <Box direction="row" gap="medium" align="center" justify="end">
              <Button
                data-test-id="confirm-invite-member"
                label="Invite"
                onClick={onConfirmInvite}
                disabled={isRequesting}
              />
              <Button
                data-test-id="cancel-invite-member"
                label="Cancel"
                primary={true}
                onClick={onCancelInvite}
                disabled={isRequesting}
              />
            </Box>
          </Box>
        </Layer>
      );
    }

    return (
      <Box flex width="xlarge" margin={{ top: 'small' }}>
        <Box direction="row" align="center" justify="between">
          <Heading level={4}>Members</Heading>
          <Box>
            <Button
              data-test-id="invite-member"
              label="Invite a new member"
              disabled={!organization.admin}
              onClick={onInvite}
              title={
                !organization.admin ? 'Only admins can invite members' : ''
              }
              color="accent"
            />
          </Box>
        </Box>
        {children}
        <Tabs flex onActive={onChangeTab} activeIndex={activeTab}>
          <Tab title="Members" data-test-id="members">
            <Box pad={{ top: 'medium' }}>
              <Members />
            </Box>
          </Tab>
          <Tab title="Invites" data-test-id="invites">
            <Box pad={{ top: 'medium' }}>
              <Invites invite={invite} />
            </Box>
          </Tab>
        </Tabs>
      </Box>
    );
  },
);

export default OrganizationTabs;

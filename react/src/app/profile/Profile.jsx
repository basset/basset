import React from 'react';
import PropTypes from 'prop-types';
import { Box, Heading, Button, TextInput, Text, Form } from 'grommet';
import { Checkmark } from 'grommet-icons';

import Notification from '../../components/Notification/Notification.jsx';
import InlineField from '../../components/InlineField/InlineField.jsx';
import GithubLogin from '../../components/LoginButtons/GithubLogin.jsx';
import BitbucketLogin from '../../components/LoginButtons/BitbucketLogin.jsx';
import GitLabLogin from '../../components/LoginButtons/GitLabLogin.jsx';

const Profile = React.memo(
  ({
    user,
    requestError,
    isUpdating,
    isRequesting,
    onShowPassword,
    showChangePassword,
    password,
    passwordError,
    changePasswordSuccess,
    onSaveName,
    onSavePassword,
    onChangePassword,
  }) => {
    const loginsEnabled = __BASSET__.logins;
    const hasGithubLogin = user.providers.some(p => p.provider === 'github');
    const hasBitbucketLogin = user.providers.some(
      p => p.provider === 'bitbucket',
    );
    const hasGitLabLogin = user.providers.some(p => p.provider === 'gitlab');
    return (
      <Box pad="medium" width="large">
        {changePasswordSuccess && (
          <Notification
            type="success"
            message="Your password has been updated"
          />
        )}
        {requestError && (
          <Notification
            type="error"
            message={`There was an error trying to update your profile`}
          />
        )}
        <Heading level={4}>Profile details</Heading>
        <InlineField title="Email" value={user.email} canChange={false} />
        <InlineField
          testId="profile-name"
          title="Full name"
          canChange={true}
          value={user.name}
          onSubmit={onSaveName}
          isUpdating={isUpdating}
        />
        <Box margin={{ top: 'medium' }}>
          {!showChangePassword && (
            <Button
              data-test-id="show-change-password"
              onClick={onShowPassword}
              label="Change password"
              alignSelf="end"
            />
          )}
          {showChangePassword && (
            <Box direction="row" justify="between">
              <Text margin={{ vertical: 'small' }}>New password</Text>
              <Form onSubmit={onSavePassword}>
                <Box direction="column">
                  <Box width="medium" alignSelf="end">
                    <TextInput
                      data-test-id="change-password-input"
                      type="password"
                      value={password}
                      onChange={event => onChangePassword(event.target.value)}
                    />
                  </Box>
                  <Box margin={{vertical: 'small'}}>
                    <Text color="status-error">{passwordError}</Text>
                  </Box>
                  <Box
                    margin={{ top: 'small' }}
                    direction="row"
                    gap="medium"
                    justify="end"
                  >
                    <Button
                      data-test-id="change-password-save"
                      type="submit"
                      label="Save"
                      disabled={isRequesting}
                      onClick={onSavePassword}
                    />
                    <Button
                      data-test-id="change-password-cancel"
                      label="Cancel"
                      onClick={onShowPassword}
                      disabled={isRequesting}
                    />
                  </Box>
                </Box>
              </Form>
            </Box>
          )}
        </Box>
        <Heading level={4}>Linked accounts for login</Heading>
        {loginsEnabled.github && (
          <Box direction="row" justify="between" align="center">
            <Text margin={{ vertical: 'small' }}>Github</Text>
            {hasGithubLogin ? (
              <Checkmark color="brand" />
            ) : (
              <GithubLogin label="Link my GitHub account" redirect="/profile" />
            )}
          </Box>
        )}
        {loginsEnabled.bitbucket && (
          <Box direction="row" justify="between" align="center">
            <Text margin={{ vertical: 'small' }}>Bitbucket</Text>
            {hasBitbucketLogin ? (
              <Checkmark color="brand" />
            ) : (
              <BitbucketLogin
                label="Link my Bitbucket account"
                redirect="/profile"
              />
            )}
          </Box>
        )}
        {loginsEnabled.gitlab && (
          <Box direction="row" justify="between" align="center">
            <Text margin={{ vertical: 'small' }}>GitLab</Text>
            {hasGitLabLogin ? (
              <Checkmark color="brand" />
            ) : (
              <GitLabLogin label="Link my GitLab account" redirect="/profile" />
            )}
          </Box>
        )}
      </Box>
    );
  },
);

Profile.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  requestError: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isUpdating: PropTypes.bool.isRequired,
  onSaveName: PropTypes.func.isRequired,
  onSavePassword: PropTypes.func.isRequired,
};

export default Profile;

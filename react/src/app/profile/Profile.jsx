import React from 'react';
import PropTypes from 'prop-types';
import { Box, Heading, Button, TextInput, Text, Form } from 'grommet';

import Notification from '../../components/Notification/Notification.jsx';
import InlineField from '../../components/InlineField/InlineField.jsx';
import GithubLogin from '../../components/GithubLogin/GithubLogin.jsx';

const Profile = React.memo(
  ({
    user,
    error,
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
    const gitHubEnabled = __BASSET__.logins.github;
    const hasGithubLogin = user.providers.some(p => p.provider === 'github');
    return (
      <Box pad="medium" width="large">
        {changePasswordSuccess && (
          <Notification
            type="success"
            message="Your password has been updated"
          />
        )}
        {error && (
          <Notification
            type="error"
            error={error}
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
                <Box width="medium" alignSelf="end">
                  <TextInput
                    data-test-id="change-password-input"
                    type="password"
                    value={password}
                    onChange={event => onChangePassword(event.target.value)}
                  />
                </Box>
                <Box margin="small">
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
              </Form>
            </Box>
          )}
        </Box>
        <Heading level={4}>Login methods</Heading>
        {gitHubEnabled && (
          <Box direction="row" justify="between">
            <Text margin={{ vertical: 'small' }}>Github</Text>
            {hasGithubLogin ? (
              <React.Fragment>Your github account is linked</React.Fragment>
            ) : (
              <React.Fragment>
                <GithubLogin label="Link my github account" multiple={false} />
              </React.Fragment>
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
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isUpdating: PropTypes.bool.isRequired,
  onSaveName: PropTypes.func.isRequired,
  onSavePassword: PropTypes.func.isRequired,
};

export default Profile;

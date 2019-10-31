import React from 'react';
import PropTypes from 'prop-types';
import { Button, Heading } from 'grommet';
import GitLab from '../Icons/Gitlab.jsx';

const GitLabLogin = ({ label, multiple, redirect }) => {
  let href = '/oauth/gitlab';
  if (redirect) {
    href = `${href}?redirect=${redirect}`;
  }
  if (!__BASSET__.logins.gitlab) {
    return null;
  }

  return (
    <React.Fragment>
      <Button
        data-test-id="test-gitlab"
        color="dark-2"
        label={label}
        href={href}
        icon={<GitLab />}
      />
      {multiple && (
        <Heading size="small" level="4" alignSelf="center" margin="xsmall">
          {'or'}
        </Heading>
      )}
    </React.Fragment>
  );
};

GitLabLogin.propTypes = {
  label: PropTypes.string.isRequired,
  redirect: PropTypes.string,
  multiple: PropTypes.bool,
};
GitLabLogin.defaultProps = {
  redirect: null,
  multiple: false,
};
export default GitLabLogin;

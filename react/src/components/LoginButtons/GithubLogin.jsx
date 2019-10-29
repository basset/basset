import React from 'react';
import PropTypes from 'prop-types';
import { Button, Heading } from 'grommet';
import { Github } from 'grommet-icons';

const GithubLogin = ({ label, multiple, redirect }) => {
  let href = '/oauth/github';
  if (redirect) {
    href = `${href}?redirect=${redirect}`;
  }
  if (!__BASSET__.logins.github) {
    return null;
  }

  return (
    <React.Fragment>
      <Button
        data-test-id="test-github"
        color="dark-2"
        label={label}
        icon={<Github />}
        href={href}
      />
      {multiple && (
        <Heading size="small" level="4" alignSelf="center" margin="xsmall">
          {'or'}
        </Heading>
      )}
    </React.Fragment>
  );
};

GithubLogin.propTypes = {
  label: PropTypes.string.isRequired,
  redirect: PropTypes.string,
  multiple: PropTypes.bool,
};
GithubLogin.defaultProps = {
  multiple: false,
  redirect: null,
};
export default GithubLogin;

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Heading } from 'grommet';
import { Github } from 'grommet-icons';

const GithubLogin = ({ label, multiple }) => {
  if (!__BASSET__.logins.github) {
    return null;
  }

  return (
    <React.Fragment>
      <Button
        alignSelf="center"
        data-test-id="test-github"
        color="dark-2"
        label={label}
        icon={<Github />}
        href="/oauth/github"
      />
      {multiple && (
        <Heading size="small" level="4" alignSelf="center">
          {'or'}
        </Heading>
      )}
    </React.Fragment>
  );
};

GithubLogin.propTypes = {
  label: PropTypes.string.isRequired,
  multiple: PropTypes.bool.isRequired,
};

export default GithubLogin;

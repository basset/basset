import React from 'react';
import PropTypes from 'prop-types';
import { Button, Heading } from 'grommet';

const BitbucketLogin = ({ label, multiple, redirect }) => {
  let href = '/oauth/bitbucket';
  if (redirect) {
    href = `${href}?redirect=${redirect}`;
  }
  if (!__BASSET__.logins.bitbucket) {
    return null;
  }

  return (
    <React.Fragment>
      <Button
        alignSelf="center"
        data-test-id="test-github"
        color="dark-2"
        label={label}
        href={href}
      />
      {multiple && (
        <Heading size="small" level="4" alignSelf="center">
          {'or'}
        </Heading>
      )}
    </React.Fragment>
  );
};

BitbucketLogin.propTypes = {
  label: PropTypes.string.isRequired,
  redirect: PropTypes.string,
  multiple: PropTypes.bool.isRequired,
};
BitbucketLogin.defaultProps = {
  redirect: null,
};
export default BitbucketLogin;

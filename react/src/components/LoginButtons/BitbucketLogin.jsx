import React from 'react';
import PropTypes from 'prop-types';
import { Button, Heading } from 'grommet';
import Bitbucket from '../Icons/Bitbucket.jsx';

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
        data-test-id="test-bitbucket"
        color="dark-2"
        label={label}
        href={href}
        icon={<Bitbucket />}
      />
      {multiple && (
        <Heading size="small" level="4" alignSelf="center" margin="xsmall">
          {'or'}
        </Heading>
      )}
    </React.Fragment>
  );
};

BitbucketLogin.propTypes = {
  label: PropTypes.string.isRequired,
  redirect: PropTypes.string,
  multiple: PropTypes.bool,
};
BitbucketLogin.defaultProps = {
  redirect: null,
  multiple: false,
};
export default BitbucketLogin;

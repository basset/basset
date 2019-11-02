import React from 'react';
import PropTypes from 'prop-types';
import { Button, Heading } from 'grommet';
import { CloudSoftware } from 'grommet-icons';

const SamlLogin = ({ label, multiple, redirect }) => {
  let href = '/saml';
  if (redirect) {
    href = `${href}?redirect=${redirect}`;
  }
  if (!__BASSET__.saml) {
    return null;
  }

  return (
    <React.Fragment>
      <Button
        data-test-id="test-saml"
        color="dark-2"
        label={label}
        icon={<CloudSoftware />}
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

SamlLogin.propTypes = {
  label: PropTypes.string.isRequired,
  redirect: PropTypes.string,
  multiple: PropTypes.bool,
};
SamlLogin.defaultProps = {
  redirect: null,
  multiple: false,
};
export default SamlLogin;

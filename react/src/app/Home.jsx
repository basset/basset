import React from 'react';
import { Box, Text } from 'grommet';

import Link from '../components/Link/Link.jsx';

export default class HomePage extends React.PureComponent {
  render() {
    const showNoOrganizations =
      !this.props.hasOrganization &&
      this.props.user &&
      this.props.user.canCreateOrganizations;
    return (
      <React.Fragment>
        {true && (
          <Box gap="large">
            <Text>You currently do not have any organizations setup</Text>
            <Text>
              Before you can submit builds, you must have an organization setup.
            </Text>
            <Link.Button
              data-test-id="create-organization"
              alignSelf="center"
              href="/organizations/create"
              label="Create an organization"
            />
          </Box>
        )}
        {this.props.children}
      </React.Fragment>
    );
  }
}

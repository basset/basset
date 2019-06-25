import React from 'react';
import { Box, Select, Text } from 'grommet';

export default React.memo(
  ({ organization, organizations, onChangeOrganization }) => {
    return (
      <Box flex direction="row" align="center" justify="start" gap="small">
        <Text size="small">Organization</Text>
        <Select
          size="small"
          data-test-id="organization-select"
          name="organization"
          placeholder="Organization"
          value={organization}
          labelKey="name"
          valueKey="id"
          options={organizations}
          onChange={({ option }) => onChangeOrganization(option)}
        />
      </Box>
    );
  },
);

import React from 'react';

import { Box, Text } from 'grommet';
import { User } from 'grommet-icons';

const ProfileImage = React.memo(({ user }) => {
  if (!user || (!user.profileImage && !user.name)) {
    return (
      <Box
        height="40px"
        width="40px"
        round="full"
        align="center"
        justify="center"
      >
       <User />
      </Box>
    );
  }
  if (user.profileImage) {
    return (
      <Box
        height="40px"
        width="40px"
        round="full"
        background={`url(${user.profileImage})`}
      />
    );
  }
  const split = user.name.split(' ');
  let initials = split[0][0].toUpperCase();
  if (split.length > 1) {
    initials = `${initials}${split[1][0].toUpperCase()}`;
  }
  return (
    <Box
      height="40px"
      width="40px"
      round="full"
      background="dark-2"
      align="center"
      justify="center"
    >
      <Text color="light-2" weight="bold">
        {initials}
      </Text>
    </Box>
  );
});

export default ProfileImage;

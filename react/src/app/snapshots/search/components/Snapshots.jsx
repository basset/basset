import React, { useState, useEffect, createRef } from 'react';
import styled from 'styled-components';

import { Image, ImageBox } from '../../components/SnapshotImage.jsx';
import { Box, Text, CheckBox, Button } from 'grommet';
import { Next, Previous } from 'grommet-icons';

const HiddenImage = styled(Image)`
  visibility: hidden;
`;

const ImageDiv = styled.div`
  background-size: 100% 100%;
  background-image: ${({ imageLocation }) => `url(${imageLocation})`};
  transition: background 2s;
`;

export const Snapshots = ({ snapshots, toggleModified, toggleFlakes }) => {
  const [transition, setTransition] = useState(false);
  const [currentSnapshot, setCurrentSnapshot] = useState(0);
  const increaseSnapshot = () => {
    let nextSnapshot = currentSnapshot + 1;
    if (nextSnapshot === snapshots.length) {
      nextSnapshot = 0;
    }
    setCurrentSnapshot(nextSnapshot);
  };
  const decreaseSnapshot = () => {
    let nextSnapshot =
      currentSnapshot === 0 ? snapshots.length - 1 : currentSnapshot - 1;
    setCurrentSnapshot(nextSnapshot);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!transition) {
        return;
      }
      increaseSnapshot();
    }, 2500);
    return () => {
      clearTimeout(timer);
    }
  }, [transition, currentSnapshot]);

  const ImageComponent = transition ? HiddenImage : Image;

  return (
    <Box flex="grow" width="100%">
      <Box align="end">
        <Box gap="small">
          <CheckBox
            toggle
            label="Show change over time"
            onChange={() => {
              setTransition(!transition);
            }}
          />
        </Box>
      </Box>
      <Box direction="row" justify="center" align="center" wrap>
        <Box margin="small">
          <Button icon={<Previous />} label="Prev" onClick={decreaseSnapshot} />
        </Box>
        <Box pad="small">
          <Button icon={<Next />} label="Next" onClick={increaseSnapshot} />
        </Box>
      </Box>
      <Box direction="column" width="large" alignSelf="center">
        <Box align="center" margin="small" direction="row" justify="between">
          <Box basis="1/3" align="start" wrap>
            <Text>
              # {currentSnapshot + 1} / {snapshots.length}
            </Text>
          </Box>
          <Box basis="1/3" align="center" wrap>
            <Text>Build #{snapshots[currentSnapshot].build.number}</Text>
          </Box>
          <Box basis="1/3"  align="end" wrap>
            <Text>Branch {snapshots[currentSnapshot].build.branch}</Text>
          </Box>
        </Box>
        <ImageBox style={{ position: 'relative' }}>
          <ImageDiv imageLocation={snapshots[currentSnapshot].imageLocation}>
            <ImageComponent src={snapshots[currentSnapshot].imageLocation} />
          </ImageDiv>
        </ImageBox>
      </Box>
    </Box>
  );
};

export default Snapshots;

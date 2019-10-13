import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Box } from 'grommet';

export const Image = styled.img`
  display: inline-block;
  vertical-align: middle;
  width: 100%;
`;
export const ImageBox = styled(Box)`
  margin: 0 auto;
  position: relative;
`;

const ImageDiff = styled.img`
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.4);
`;

const SnapshotImage = ({ snapshot, diff, onToggleDiff }) => {
  if (!snapshot) {
    return null;
  }
  return (
    <Box pad={{ horizontal: 'small' }} margin={{ top: 'medium' }} flex>
      <ImageBox border={{ color: 'light-4' }}>
        <Image
          data-test-id="snapshot"
          src={`/screenshots/${snapshot.id}`}
          onClick={() => onToggleDiff(snapshot)}
        />
        {diff && snapshot.snapshotDiff && (
          <ImageDiff
            data-test-id="snapshot-overlay"
            src={`/screenshots/diff/${snapshot.snapshotDiff.id}`}
            onClick={() => onToggleDiff(snapshot)}
          />
        )}
      </ImageBox>
    </Box>
  );
};
SnapshotImage.propTypes = {
  snapshot: PropTypes.object,
  diff: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  onToggleDiff: PropTypes.func,
};
SnapshotImage.defaultProps = {
  diff: false,
  snapshot: null,
  onToggleDiff: () => {},
  animate: false,
};

export default SnapshotImage;

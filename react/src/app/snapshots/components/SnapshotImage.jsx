import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Box } from 'grommet';

export const Image = styled.img`
  display: inline-block;
  vertical-align: middle;
  width: 100%;
  cursor: ${props => `${props.diff ? 'pointer' : ''}`};
  transform: ${props => `${props.center ? `translate(${-200/(props.w/(props.center.x - (props.w/2)))}%, ${-200/(props.h/(props.center.y - (props.h/2)))}%) scale(2)` : ''}`};
`;
export const ImageBox = styled(Box)`
  margin: 0 auto;
  position: relative;
  overflow: hidden;
`;

const ImageDiff = styled.img`
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transform: ${props => `${props.center ? `translate(${-200/(props.w/(props.center.x - (props.w/2)))}%, ${-200/(props.h/(props.center.y - (props.h/2)))}%) scale(2)` : ''}`};
 `;

const RippleIndicator = styled.div`
  position: absolute;
  top: ${props => `calc((${props.y} / ${props.height} * 100%) - 30px)`};
  left: ${props => `calc((${props.x} / ${props.width} * 100%) - 30px)`};
  height: 60px;
  width: 60px;
  border-radius: 100%;
  div {
    position: absolute;
    border: 4px solid #2190eb;
    opacity: 1;
    border-radius: 50%;
    animation: lds-ripple 3s cubic-bezier(0, 0.2, 0.8, 2) infinite;
  }
  div:nth-child(2) {
    animation-delay: -0.5s;
  }
  @keyframes lds-ripple {
    0% {
      top: 26px;
      left: 26px;
      width: 0;
      height: 0;
      opacity: 1;
  }
    100% {
      top: 0px;
      left: 0px;
      width: 52px;
      height: 52px;
      opacity: 0;
    }
  }
`;

const SnapshotImage = ({ snapshot, diff, onToggleDiff, center }) => {
  const [ height, setHeight ] = useState(0);
  const [ loaded, setLoaded ] = useState(false);
  if (!snapshot) {
    return null;
  }
  const onLoad = event => {
    const target = event.target;
    setHeight(target.naturalHeight);
    setLoaded(true);
  };
  console.log(!diff && center);
  console.log(!diff && snapshot)

  return (
    <Box pad={{ horizontal: 'small' }} margin={{ top: 'medium' }} flex>
      <ImageBox border={{ color: 'light-4' }}>
        <Image
          data-test-id="snapshot"
          src={snapshot.url}
          onClick={() => onToggleDiff(snapshot)}
          diff={snapshot.snapshotDiff}
          center={center}
          onLoad={onLoad}
          h={height}
          w={snapshot.width}
        />
        {diff && snapshot.snapshotDiff && (
          <React.Fragment>
            <ImageDiff
              data-test-id="snapshot-overlay"
              src={snapshot.snapshotDiff.url}
              onClick={() => onToggleDiff(snapshot)}
              center={center}
              h={height}
              w={snapshot.width}
            />
            {!center && loaded && snapshot.snapshotDiff.centers && snapshot.snapshotDiff.centers.map(c => (
              <RippleIndicator
                key={`${c.x}-${c.y}`}
                x={c.x}
                y={c.y}
                height={height}
                width={snapshot.width}
                radius={c.radius}
              >
                <div />
                <div />
              </RippleIndicator>
            ))}
          </React.Fragment>
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

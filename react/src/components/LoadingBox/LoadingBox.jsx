import { Box } from 'grommet';
import styled from 'styled-components';

export default styled(Box)`
  background-size: 200% 200%;
  animation: barberpole 25s ease infinite;
  animation-delay: 0.5s;
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 2rem,
    rgba(125, 125, 125, 0.05) 2rem,
    rgba(125, 125, 125, 0.05) 4rem
  );
  @keyframes barberpole {
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Progress = styled(Box)`
  position: relative;
  @keyframes progress-active {
    100% {
      width: 100%;
    }
  }
  :after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 0%;
    background: rgba(255, 255, 255, 0.1);
    animation: progress-active 5s ease infinite;
  }
`;

export { Progress };

import styled from 'styled-components';
import { Box } from 'grommet';

const StickyBox = styled(Box)`
  position: ${props => (props.unstick ? 'unset' : 'sticky')};
  top: ${props => props.top || '0'};
  z-index: ${props => props.zIndex || '5'};
`;

export default StickyBox;

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box, Button, Text, Heading } from 'grommet';

import {
  getIsApproving,
} from '../../../redux/snapshots/selectors.js';
import {
  approveAllSnapshots,
} from '../../../redux/snapshots/actions.js';

import StickyBox from '../../../components/StickyBox/StickyBox.jsx';

class SnapshotType extends React.PureComponent {
  static propTypes = {
    type: PropTypes.string.isRequired,
    typeName: PropTypes.string.isRequired,
    countText: PropTypes.string.isRequired,
    canApproveAll: PropTypes.bool,
    isApproving: PropTypes.bool.isRequired,
    onApproveAll: PropTypes.func.isRequired,
  };

  renderApproveAll = () => {
    if (!this.props.canApproveAll) {
      return null;
    }
    return (
      <Box alignSelf="end">
        <Button
          primary
          color="brand"
          label="Approve All"
          disabled={this.props.isApproving}
          onClick={this.props.onApproveAll}
        />
      </Box>
    );
  };

  render() {
    return (
      <StickyBox
        fill="horizontal"
        padding="small"
        background="white"
        margin={{ bottom: 'small' }}
        direction="row"
        justify="between"
        align="center"
        zIndex="6"
      >
        <Box flex direction="row" align="center" justify="center">
          <Heading level={4}>
            <Box direction="row" gap="small">
              <Text>
                {this.props.typeName} <Text color="dark-3">{this.props.countText}</Text>
              </Text>
            </Box>
          </Heading>
          <Box flex>{this.props.type === 'modified' && this.renderApproveAll()}</Box>
        </Box>
      </StickyBox>
    );
  }
}


const mapState = state => {
  return {
    isApproving: getIsApproving(state),
  };
};

const mapAction = dispatch => ({
  onApproveAll: () => dispatch(approveAllSnapshots()),
});

export default connect(
  mapState,
  mapAction,
)(SnapshotType);

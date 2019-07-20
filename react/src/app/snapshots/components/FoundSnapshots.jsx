import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box, Button } from 'grommet';

import { getIsApproving } from '../../../redux/snapshots/selectors.js';
import {
  showSnapshot,
  approveSnapshot,
} from '../../../redux/snapshots/actions.js';

import Snapshot from './Snapshot.jsx';
import SnapshotType from './SnapshotType.jsx';
import Loader from '../../../components/Loader/Loader.jsx';

class FoundSnapshots extends React.PureComponent {
  static propTypes = {
    isSearching: PropTypes.bool.isRequired,
    foundSnapshots: PropTypes.array,
    onClearSearchResults: PropTypes.func.isRequired,
  };

  render() {
    if (!this.props.foundSnapshots) {
      return null;
    }
    return (
      <Box border="bottom">
        <SnapshotType
          type="found"
          typeName="Found snapshots"
          countText={`(${this.props.foundSnapshots.length})`}
        />
        <Box margin={{ vertical: 'small' }}>
          <Button
            data-test-id="clear-results"
            alignSelf="center"
            label="Clear results"
            onClick={this.props.onClearSearchResults}
          />
        </Box>
        {this.props.isSearching && <Loader />}
        {this.props.foundSnapshots.map((snapshot, index) => (
          <Snapshot
            index={index}
            key={snapshot.id}
            snapshot={snapshot}
            onApprove={() => this.props.onApproveSnapshot(snapshot)}
            onExpand={() => this.props.onExpand(snapshot)}
            type={snapshot.type}
            isApproving={this.props.isApproving}
          />
        ))}
      </Box>
    );
  }
}

const mapState = state => {
  return {
    isApproving: getIsApproving(state),
  };
};

const mapAction = dispatch => ({
  onExpand: snapshot => dispatch(showSnapshot(snapshot)),
  onApproveSnapshot: snapshot => dispatch(approveSnapshot(snapshot)),
});

export default connect(
  mapState,
  mapAction,
)(FoundSnapshots);

import React from 'react';
import { connect } from 'react-redux';

import {
  getCurrentSnapshot,
  getIsLoading,
  getIsApproving,
} from '../../redux/snapshots/selectors.js';
import { approveSnapshot } from '../../redux/snapshots/actions.js';

import Snapshot from './components/Snapshot.jsx';
import Loader from '../../components/Loader/Loader.jsx';

export const SnapshotController = ({
  isLoading,
  isApproving,
  snapshot,
  onApproveSnapshot,
}) => {
  if (isLoading.single) {
    return <Loader />;
  }
  if (!snapshot) {
    return null;
  }
  return (
    <Snapshot
      snapshot={snapshot}
      onApprove={() => onApproveSnapshot(snapshot)}
      isExpanded
      isApproving={isApproving}
      shrinkHref={`/builds/${snapshot.buildId}`}
    />
  );
};

const mapState = state => ({
  isLoading: getIsLoading(state),
  isApproving: getIsApproving(state),
  snapshot: getCurrentSnapshot(state),
});

const mapAction = dispatch => ({
  onApproveSnapshot: snapshot => dispatch(approveSnapshot(snapshot)),
});

export default connect(
  mapState,
  mapAction,
)(SnapshotController);

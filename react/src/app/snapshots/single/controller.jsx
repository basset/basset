import React from 'react';
import { connect } from 'react-redux';

import {
  getCurrentSnapshot,
  getIsLoading,
  getIsApproving,
} from '../../../redux/snapshots/selectors.js';
import { approveSnapshot } from '../../../redux/snapshots/actions.js';
import { getUser } from '../../../redux/user/selectors.js';
import { goLogin } from '../../../redux/router/actions.js';

import Snapshot from '../components/Snapshot.jsx';
import Loader from '../../../components/Loader/Loader.jsx';

export const SnapshotController = ({
  isLoading,
  isApproving,
  snapshot,
  user,
  onApproveSnapshot,
}) => {
  if (isLoading.single) {
    return <Loader />;
  }
  if (!snapshot && !user.id) {
    goLogin();
    return null;
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
  user: getUser(state),
});

const mapAction = dispatch => ({
  onApproveSnapshot: snapshot => dispatch(approveSnapshot(snapshot)),
});

export default connect(
  mapState,
  mapAction,
)(SnapshotController);

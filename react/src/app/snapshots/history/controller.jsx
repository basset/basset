import React from 'react';
import { connect } from 'react-redux';
import { goLogin } from '../../../redux/router/actions';

import {
  getSnapshots,
  getIsLoading,
  getIsLoadingMore,
  getPageInfo,
  getIsApproving,
} from '../../../redux/snapshots/selectors.js';
import { approveSnapshot } from '../../../redux/snapshots/actions.js';

import Loader from '../../../components/Loader/Loader.jsx';
import { getUser } from '../../../redux/user/selectors.js';
import Snapshots from './components/Snapshots.jsx';

export const SnapshotHistoryController = ({ isLoading, snapshots, user }) => {
  if (isLoading) {
    return <Loader />;
  }
  if (snapshots.length === 0 && !user.id) {
    goLogin();
    return null;
  }
  return <Snapshots snapshots={snapshots} />;
};

const mapState = state => {
  return {
    isLoading: getIsLoading(state).history,
    isLoadingMore: getIsLoadingMore(state).history,
    snapshots: getSnapshots(state).history,
    pageInfo: getPageInfo(state).history,
    isApproving: getIsApproving(state),
    user: getUser(state),
  };
};

const mapAction = dispatch => ({
  onApproveSnapshot: snapshot => dispatch(approveSnapshot(snapshot)),
});

export default connect(
  mapState,
  mapAction,
)(SnapshotHistoryController);

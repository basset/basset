import React from 'react';
import { connect } from 'react-redux';

import {
  getSnapshots,
  getIsLoading,
  getIsLoadingMore,
  getPageInfo,
  getIsApproving,
} from '../../../redux/snapshots/selectors.js';
import { approveSnapshot } from '../../../redux/snapshots/actions.js';

import Loader from '../../../components/Loader/Loader.jsx';
import Snapshots from './components/Snapshots.jsx';

export const SnapshotSearchController = ({
  isLoading,
  snapshots,
}) => {
  if (isLoading) {
    return <Loader />;
  }
  return (
    <Snapshots snapshots={snapshots} />
  )
};

const mapState = state => {
  return {
    isLoading: getIsLoading(state).search,
    isLoadingMore: getIsLoadingMore(state).search,
    snapshots: getSnapshots(state).search,
    pageInfo: getPageInfo(state).search,
    isApproving: getIsApproving(state),
  };
};

const mapAction = dispatch => ({
  onApproveSnapshot: snapshot => dispatch(approveSnapshot(snapshot)),
});

export default connect(
  mapState,
  mapAction,
)(SnapshotSearchController);

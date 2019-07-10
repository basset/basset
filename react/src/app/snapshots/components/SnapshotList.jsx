import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box, Button, Heading } from 'grommet';

import { getCurrentBuild } from '../../../redux/builds/selectors.js';
import {
  getSnapshots,
  getIsLoading,
  getIsLoadingMore,
  getPageInfo,
  getIsApproving,
  getCurrentSnapshotId,
} from '../../../redux/snapshots/selectors.js';
import {
  showSnapshot,
  approveSnapshot,
  approveAllSnapshots,
  getSnapshots as loadSnapshots,
  loadMore,
  loadMoreFromGroup,
} from '../../../redux/snapshots/actions.js';

import Snapshot from './Snapshot.jsx';
import SnapshotType from './SnapshotType.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
import LoadMoreButton from '../../../components/LoadMoreButton/LoadMoreButton.jsx';

class SnapshotList extends React.PureComponent {
  static propTypes = {
    type: PropTypes.string.isRequired,
    typeName: PropTypes.string.isRequired,
    build: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isLoadingMore: PropTypes.bool.isRequired,
    currentSnapshot: PropTypes.object,
    snapshots: PropTypes.array.isRequired,
    pageInfo: PropTypes.object.isRequired,
    isApproving: PropTypes.bool.isRequired,
    onExpand: PropTypes.func.isRequired,
    onApproveSnapshot: PropTypes.func.isRequired,
    onViewSnapshots: PropTypes.func.isRequired,
    onLoadMore: PropTypes.func.isRequired,
  };

  getCount(type) {
    const { build } = this.props;
    if (type === 'modified') {
      return build.modifiedSnapshots;
    }
    if (type === 'unmodified') {
      return (
        build.totalSnapshots - build.modifiedSnapshots - build.newSnapshots
      );
    }
    if (type === 'new') {
      return build.newSnapshots;
    }
    if (type === 'removed') {
      return build.removedSnapshots;
    }
    if (type === 'flake') {
      return build.flakedSnapshots;
    }
  }

  render() {
    if (this.props.isLoading) {
      return (
        <Box>
          <Box
            fill="horizontal"
            padding="small"
            margin={{ vertical: 'small' }}
            direction="row"
          >
            <Heading level="4">{this.props.typeName}</Heading>
          </Box>
          <Loader />
        </Box>
      );
    }
    let children;
    const { snapshots } = this.props;
    const count = this.getCount(this.props.type);
    const hasMore = this.props.pageInfo.hasNextPage;
    const isLoadingMore = this.props.isLoadingMore;
    const noSnapshots = snapshots.length === 0 && count === 0;
    const countText = noSnapshots ? '(None)' : `(${count})`;

    if (snapshots.length === 0 && count === 0) {
      children = null;
    } else if (snapshots.length === 0 && count > 0) {
      children = (
        <Box align="center">
          <Button
            label={`View ${this.props.type} snapshots`}
            color="accent-1"
            onClick={() => this.props.onViewSnapshots(this.props.type)}
          />
        </Box>
      );
    } else {
      let index = 0;
      children = (
        <Box>
          {snapshots.map(snapshot => (
            <Snapshot
              index={index++}
              key={snapshot.id}
              snapshot={snapshot}
              onApprove={() => this.props.onApproveSnapshot(snapshot)}
              onExpand={() => this.props.onExpand(snapshot)}
              type={this.props.type}
              isApproving={this.props.isApproving}
              active={this.props.currentSnapshotId === snapshot.id}
            />
          ))}
          {hasMore && (
            <Box align="center" margin="small">
              <LoadMoreButton
                isLoadingMore={isLoadingMore}
                onLoadMore={() => this.props.onLoadMore(this.props.type)}
              />
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Box margin={{ vertical: 'small' }}>
        <SnapshotType
          type={this.props.type}
          typeName={this.props.typeName}
          countText={countText}
        />
        {children}
      </Box>
    );
  }
}

const mapState = (state, { type }) => {
  const build = getCurrentBuild(state);
  return {
    isLoading: getIsLoading(state)[type],
    isLoadingMore: getIsLoadingMore(state)[type],
    snapshots: getSnapshots(state)[type],
    pageInfo: getPageInfo(state)[type],
    isApproving: getIsApproving(state),
    build,
    currentSnapshotId: getCurrentSnapshotId(state),
  };
};

const mapAction = dispatch => ({
  onExpand: snapshot => dispatch(showSnapshot(snapshot)),
  onApproveSnapshot: snapshot => dispatch(approveSnapshot(snapshot)),
  onApproveAll: () => dispatch(approveAllSnapshots()),
  onViewSnapshots: type => dispatch(loadSnapshots(type)),
  onLoadMore: type => dispatch(loadMore(type)),
  onLoadMoreFromGroup: group => dispatch(loadMoreFromGroup(group)),
});

export default connect(
  mapState,
  mapAction,
)(SnapshotList);

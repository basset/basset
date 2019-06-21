import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box, Heading } from 'grommet';

import { getCurrentBuild } from '../../../redux/builds/selectors.js';
import {
  getIsLoadingGroups,
  getIsLoadingMoreFromGroup,
  getGroupsPageInfo,
  getIsLoadingMoreGroups,
  getIsApproving,
  getCurrentSnapshot,
  getSnapshotGroups,
  getShowMoreFromGroup,
} from '../../../redux/snapshots/selectors.js';
import {
  showSnapshot,
  approveSnapshot,
  approveGroupSnapshots,
  loadMoreFromGroup,
  showMoreFromGroup,
  loadMoreGroups,
  addSnapshotFlake,
} from '../../../redux/snapshots/actions.js';

import Snapshot from './Snapshot.jsx';
import SnapshotType from './SnapshotType.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
import LoadMoreButton from '../../../components/LoadMoreButton/LoadMoreButton.jsx';

class SnapshotGroups extends React.PureComponent {
  static propTypes = {
    showMoreFromGroup: PropTypes.object.isRequired,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        group: PropTypes.number,
        snapshots: PropTypes.shape({
          pageInfo: PropTypes.shape({
            hasNextPage: PropTypes.bool.isRequired,
          }),
          edges: PropTypes.array.isRequired,
          totalCount: PropTypes.number.isRequired,
        }).isRequired,
      }),
    ),
    build: PropTypes.object.isRequired,
    currentSnapshot: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    canApproveAll: PropTypes.bool.isRequired,
    isApproving: PropTypes.bool.isRequired,
    isLoadingMoreFromGroup: PropTypes.object.isRequired,
    isLoadingMoreGroups: PropTypes.bool.isRequired,
    onExpand: PropTypes.func.isRequired,
    onApproveSnapshot: PropTypes.func.isRequired,
    onLoadMoreFromGroup: PropTypes.func.isRequired,
  };

  currentSnapshotId = this.props.currentSnapshot
    ? this.props.currentSnapshot.id
    : null;

  render() {
    const typeName = 'Modified snapshots';
    if (this.props.isLoading) {
      return (
        <Box>
          <Box
            fill="horizontal"
            padding="small"
            margin={{ vertical: 'small' }}
            direction="row"
          >
            <Heading level="4">{typeName}</Heading>
          </Box>
          <Loader />
        </Box>
      );
    }
    let children;
    const { groups } = this.props;
    const count = this.props.build.modifiedSnapshots;
    const noSnapshots = groups.length === 0 && count === 0;
    const countText = noSnapshots ? '(None)' : `(${count})`;

    if (noSnapshots) {
      children = null;
    } else {
      let index = 0;
      children = (
        <Box>
          {groups.map(group => {
            if (!group) {
              return null;
            }
            const showingMore =
              group.group == null ||
              !!this.props.showMoreFromGroup[group.group];
            if (!showingMore) {
              index += group.snapshots.totalCount;
            }
            return (
              <React.Fragment key={group.group}>
                {group.snapshots.edges
                  .filter((edge, index) => (showingMore ? true : index === 0))
                  .map(e => e.node)
                  .map(snapshot => {
                    return (
                      <Snapshot
                        group={group}
                        canAddFlake={showingMore}
                        showingMoreThanOne={showingMore}
                        key={snapshot.id}
                        index={showingMore ? index++ : index}
                        snapshot={snapshot}
                        onApprove={() =>
                          this.props.onApproveSnapshot({ group, snapshot })
                        }
                        onApproveGroup={() => this.props.onApproveGroup(group)}
                        onLoadMoreFromGroup={() =>
                          this.props.onLoadMoreFromGroup(group)
                        }
                        onShowMoreFromGroup={() =>
                          this.props.onShowMoreFromGroup(group)
                        }
                        onExpand={() => this.props.onExpand(snapshot)}
                        type={this.props.type}
                        isApproving={this.props.isApproving}
                        active={this.currentSnapshotId === snapshot.id}
                        onToggleFlake={() =>
                          this.props.onToggleFlake({ group, snapshot })
                        }
                      />
                    );
                  })}
                {group.snapshots.pageInfo.hasNextPage && (
                  <Box align="center" margin="small">
                    <LoadMoreButton
                      isLoadingMore={!!this.props.isLoadingMoreFromGroup[group]}
                      onLoadMore={() => this.props.onLoadMoreFromGroup(group)}
                      label="Load more from group"
                    />
                  </Box>
                )}
              </React.Fragment>
            );
          })}
          {this.props.pageInfo.hasNextPage && (
            <Box align="center" margin="small">
              <LoadMoreButton
                isLoadingMore={this.props.isLoadingMoreGroups}
                onLoadMore={() => this.props.onLoadMoreGroups()}
              />
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Box margin={{ vertical: 'small' }}>
        <SnapshotType
          type="modified"
          typeName={typeName}
          countText={countText}
          canApproveAll={this.props.canApproveAll}
        />
        {children}
      </Box>
    );
  }
}

const mapState = state => {
  const build = getCurrentBuild(state);
  return {
    isLoading: getIsLoadingGroups(state),
    isLoadingMoreGroups: getIsLoadingMoreGroups(state),
    isLoadingMoreFromGroup: getIsLoadingMoreFromGroup(state),
    groups: getSnapshotGroups(state),
    showMoreFromGroup: getShowMoreFromGroup(state),
    isApproving: getIsApproving(state),
    pageInfo: getGroupsPageInfo(state),
    canApproveAll: build.approvedSnapshots < build.modifiedSnapshots,
    build,
    currentSnapshot: getCurrentSnapshot(state),
  };
};

const mapAction = dispatch => ({
  onExpand: snapshot => dispatch(showSnapshot(snapshot)),
  onApproveSnapshot: (group, snapshot) =>
    dispatch(approveSnapshot(group, snapshot)),
  onLoadMoreFromGroup: group => dispatch(loadMoreFromGroup(group)),
  onShowMoreFromGroup: group => dispatch(showMoreFromGroup(group.group)),
  onLoadMoreGroups: () => dispatch(loadMoreGroups()),
  onToggleFlake: (group, snapshot) =>
    dispatch(addSnapshotFlake(group, snapshot)),
  onApproveGroup: group => dispatch(approveGroupSnapshots(group)),
});

export default connect(
  mapState,
  mapAction,
)(SnapshotGroups);

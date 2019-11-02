import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Box, Heading } from 'grommet';

import SnapshotHeader, { VIEWS } from './SnapshotHeader.jsx';
import SnapshotImage from './SnapshotImage.jsx';

class Snapshot extends React.PureComponent {
  static propTypes = {
    group: PropTypes.object,
    canAddFlake: PropTypes.bool,
    showingMore: PropTypes.bool,
    snapshot: PropTypes.object.isRequired,
    isExpanded: PropTypes.bool,
    isApproving: PropTypes.bool.isRequired,
    index: PropTypes.number,
    type: PropTypes.string,
    projectType: PropTypes.string,
    onShrink: PropTypes.func,
    onExpand: PropTypes.func,
    onApprove: PropTypes.func,
    onLoadMoreFromGroup: PropTypes.func,
    onShowMoreFromGroup: PropTypes.func,
    onToggleFlake: PropTypes.func,
  };
  state = {
    isCollapsed: false,
    isExpanded: this.props.isExpanded,
    view: this.getDefaultView,
    showDiff: true,
  };

  static defaultProps = {
    isExpanded: false,
  };

  componentDidMount() {
    if (this.props.active) {
      const el = document.getElementById(this.props.snapshot.id);
      if (el) {
        el.scrollIntoView();
      }
    }
  }

  onToggleDiff = snapshot => {
    if (
      this.props.snapshot.snapshotDiff &&
      snapshot.id === this.props.snapshot.id
    ) {
      this.setState(state => ({
        ...state,
        showDiff: !state.showDiff,
      }));
    }
  };

  get isRemovedOrUnmodified() {
    return this.props.type === 'removed' || this.props.type === 'unmodified';
  }

  get getDefaultView() {
    if (this.isRemovedOrUnmodified) {
      return VIEWS.original;
    }
    if (
      this.props.snapshot.previousApproved &&
      this.props.snapshot.snapshotDiff
    ) {
      return VIEWS.both;
    }
    return VIEWS.new;
  }

  handleShrink = () => {
    if (this.props.onShrink) {
      this.props.onShrink();
    } else if (this.state.isExpanded) {
      this.setState(state => ({
        ...state,
        isExpanded: false,
      }));
    } else if (!this.state.isCollapsed) {
      this.setState(state => ({
        ...state,
        isCollapsed: true,
      }));
    }
  };

  handleExpand = () => {
    if (this.state.isCollapsed) {
      this.setState(state => ({
        ...state,
        isCollapsed: false,
      }));
    } else {
      this.props.onExpand();
    }
  };

  handleChangeView = view => {
    if (this.state.view !== view) {
      this.setState(state => ({
        ...state,
        view,
      }));
    }
  };

  renderLabel(text) {
    return (
      <Box align="center" flex>
        <Heading size="small" level={5}>
          {text}
        </Heading>
      </Box>
    );
  }

  renderView() {
    if (this.state.isCollapsed) {
      return null;
    }

    const hasPreviousApproved = this.props.snapshot.previousApproved !== null;

    const showBoth = this.state.view === VIEWS.both;
    const showNew = showBoth || this.state.view === VIEWS.new;
    const showOriginal =
      this.isRemovedOrUnmodified ||
      ((showBoth || this.state.view === VIEWS.original) && hasPreviousApproved);
    const showDiff = this.state.showDiff && this.props.snapshot.snapshotDiff;

    const previousApproved =
      this.props.type === 'removed'
        ? this.props.snapshot
        : this.props.snapshot.previousApproved;
    return (
      <React.Fragment>
        {showBoth && (
          <Box className="image-labels" direction="row" justify="between">
            {showOriginal && this.renderLabel('Original')}
            {showNew && this.renderLabel(showDiff ? 'Diff' : 'New')}
          </Box>
        )}
        <Box className="images" direction="row" flex>
          {showOriginal && (
            <SnapshotImage
              snapshot={previousApproved}
              diff={false}
              onToggleDiff={this.onToggleDiff}
            />
          )}
          {showNew && (
            <SnapshotImage
              snapshot={this.props.snapshot}
              diff={showDiff}
              onToggleDiff={this.onToggleDiff}
            />
          )}
        </Box>
      </React.Fragment>
    );
  }

  render() {
    return (
      <Box
        id={this.props.snapshot.id}
        className="snapshot"
        margin={{
          vertical: 'medium',
        }}
        fill="horizontal"
        background="white"
        round
        flex="grow"
      >
        <SnapshotHeader
          canAddFlake={this.props.canAddFlake}
          showingMoreThanOne={this.props.showingMoreThanOne}
          group={this.props.group}
          index={this.props.index}
          snapshot={this.props.snapshot}
          onApprove={this.props.onApprove}
          onApproveGroup={this.props.onApproveGroup}
          onShrink={this.handleShrink}
          canShrink={!this.state.isCollapsed}
          canExpand={!this.state.isExpanded}
          onExpand={this.handleExpand}
          view={this.state.view}
          onChangeView={this.handleChangeView}
          type={this.props.type}
          projectType={this.props.projectType}
          isApproving={this.props.isApproving}
          onShowMoreFromGroup={this.props.onShowMoreFromGroup}
          onToggleFlake={this.props.onToggleFlake}
        />
        {this.renderView()}
      </Box>
    );
  }
}

export default Snapshot;

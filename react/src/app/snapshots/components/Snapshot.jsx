import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Box, Heading } from 'grommet';

import SnapshotHeader, { VIEWS } from './SnapshotHeader.jsx';

const Image = styled.img`
  display: inline-block;
  vertical-align: middle;
  width: 100%;
`;
const ImageBox = styled(Box)`
  margin: 0 auto;
  position: relative;
`;

const ImageDiff = styled.img`
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.4);
`;

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

  renderImage(snapshot, diff) {
    if (!snapshot) {
      return null;
    }

    return (
      <Box pad={{ horizontal: 'small' }} margin={{ top: 'medium' }} flex>
        <ImageBox border={{ color: 'light-4' }}>
          <Image
            data-test-id="snapshot"
            src={snapshot.imageLocation}
            onClick={() => this.onToggleDiff(snapshot)}
          />
          {diff && this.props.snapshot.snapshotDiff && (
            <ImageDiff
              data-test-id="snapshot-overlay"
              src={this.props.snapshot.snapshotDiff.imageLocation}
              onClick={() => this.onToggleDiff(snapshot)}
            />
          )}
        </ImageBox>
      </Box>
    );
  }

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
          {showOriginal && this.renderImage(previousApproved, false)}
          {showNew && this.renderImage(this.props.snapshot, showDiff)}
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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Box,
  Text,
  Button,
  Heading,
  ResponsiveContext,
  DropButton,
} from 'grommet';
import {
  Clone,
  Chrome,
  Firefox,
  Contract,
  Expand,
  StatusGood,
  Multiple,
  History,
} from 'grommet-icons';

import Tooltip from '../../../components/Tooltip/Tooltip.jsx';
import Link from '../../../components/Link/Link.jsx';
import StickyBox from '../../../components/StickyBox/StickyBox.jsx';
import Flake from '../../../components/Icons/Flake.jsx';
import Ellipsis from '../../../components/Icons/Ellipsis.jsx';

const getBrowserType = browser => {
  if (browser === 'chrome') {
    return (
      <Box title="Firefox">
        <Chrome color="plain" />
      </Box>
    );
  }
  if (browser === 'firefox') {
    return (
      <Box title="Firefox">
        <Firefox color="plain" />
      </Box>
    );
  }
  return <Text>Browser</Text>;
};

export const VIEWS = {
  original: 0,
  new: 1,
  both: 2,
};

const Header = ({ children }) => (
  <Heading
    margin={{ horizontal: 'small' }}
    size="large"
    level={4}
    style={{ wordBreak: 'break-all' }}
  >
    {children}
  </Heading>
);

const SnapshotHeader = React.memo(
  ({
    canAddFlake,
    showingMoreThanOne,
    group,
    snapshot,
    index,
    view,
    type,
    isApproving,
    canShrink,
    canExpand,
    onApprove,
    onApproveGroup,
    onShrink,
    onExpand,
    onChangeView,
    onShowMoreFromGroup,
    onToggleFlake,
  }) => {
    const noDifference = ['removed', 'unmodified', 'flakey'].includes(type);
    const hasPrevious = snapshot.previousApproved !== null;
    const canShow = {
      original: noDifference || hasPrevious,
      new: !noDifference,
      both: !noDifference && hasPrevious,
    };
    const renderShowMoreButton = () => {
      return (
        <Box margin={{ vertical: 'small' }}>
          <Button
            data-test-id="show-snapshot-group"
            color="accent-1"
            label={`Show more snapshots`}
            onClick={onShowMoreFromGroup}
          />
        </Box>
      );
    };
    const renderApproveButton = () => {
      if (!showingMoreThanOne) {
        const groupApproved =
          group.approvedSnapshots === group.snapshots.totalCount;
        if (groupApproved) {
          return (
            <Tooltip label="Group approved">
              <Box margin={{ horizontal: 'small' }} alignSelf="end">
                <StatusGood color="brand" />
              </Box>
            </Tooltip>
          );
        } else {
          return (
            <Button
              data-test-id="approve-group-snapshot"
              label="Approve group"
              disabled={isApproving}
              onClick={onApproveGroup}
            />
          );
        }
      }
      if (snapshot.snapshotFlake) {
        return null;
      }
      if (snapshot.approved) {
        const approvedBy = snapshot.approvedBy.user.name;
        const approvedOn = moment(parseInt(snapshot.approvedOn)).format(
          'YYYY-MM-DD hh:mm a',
        );
        return (
          <Tooltip label={`Approved by ${approvedBy} on ${approvedOn}`}>
            <Box margin={{ horizontal: 'small' }} alignSelf="end">
              <StatusGood color="brand" />
            </Box>
          </Tooltip>
        );
      }
      if (snapshot.diff) {
        return (
          <Button
            data-test-id="approve-snapshot"
            label="Approve"
            disabled={isApproving}
            onClick={onApprove}
          />
        );
      }
      return <Box margin={{ horizontal: 'small' }} />;
    };
    const renderFlakeButton = () => {
      const isActive = snapshot.snapshotFlake !== null;
      if (!canAddFlake || snapshot.approved || !snapshot.diff) {
        return null;
      }
      const tooltip = isActive
        ? `${
            snapshot.snapshotFlake.createdBy.user.name
          } added this as a test flake`
        : 'Add this diff as a test flake for future builds';
      const color = isActive ? '#2190eb' : '#444444';
      const children = (
        <Tooltip label={tooltip}>
          <Box pad="small">
            <Flake color={color} />
          </Box>
        </Tooltip>
      );
      if (isActive) {
        return children;
      }
      return (
        <Button data-test-id="add-snapshot-flakey" onClick={onToggleFlake}>
          {children}
        </Button>
      );
    };
    const renderExpandButton = () => {
      if (!canShrink) {
        return (
          <Button
            data-test-id="expand-snapshot-button"
            disabled={!canExpand}
            icon={<Expand />}
            onClick={onExpand}
          />
        );
      }
      if (!canExpand) {
        return (
          <Button
            disabled
            data-test-id="expand-snapshot-button"
            icon={<Expand />}
          />
        );
      }
      return (
        <Link.Button
          data-test-id="expand-snapshot-link"
          disabled={!canExpand}
          icon={<Expand />}
          href={`/snapshots/${snapshot.id}`}
        />
      );
    };

    const renderShrinkButton = () => {
      if (canExpand) {
        return (
          <Button
            data-test-id="shrink-snapshot-button"
            disabled={!canShrink}
            icon={<Contract />}
            onClick={onShrink}
          />
        );
      }
      return (
        <Link.Button
          data-test-id="shrink-snapshot-link"
          disabled={!canShrink}
          icon={<Contract />}
          href={`/builds/${snapshot.buildId}/${snapshot.id}`}
        />
      );
    };

    const renderTitle = size => {
      const props = {};
      if (size !== 'small') {
        props.basis = '1/3';
      }
      return (
        <Box
          direction="row"
          align="center"
          pad={{ right: 'small' }}
          {...props}
          wrap
        >
          {!showingMoreThanOne && (
            <React.Fragment>
              <Multiple />
              <Header>
                {group.snapshots.totalCount - 1} similar snapshots
              </Header>
            </React.Fragment>
          )}
          {showingMoreThanOne && (
            <React.Fragment>
              {index >= 0 && (
                <Box margin={{ right: 'small' }}>#{index + 1}</Box>
              )}
              <Clone />
              <Header>{snapshot.title}</Header>
            </React.Fragment>
          )}
        </Box>
      );
    };

    const renderViewButtons = size => {
      const props = {};
      if (size !== 'small') {
        props.flex = true;
      }
      return (
        <Box direction="row" justify="center" {...props} wrap>
          {canShrink && (
            <React.Fragment>
              <Button
                data-test-id="show-original"
                disabled={!canShow.original}
                label="Original"
                round={{ corner: 'left' }}
                active={view === VIEWS.original}
                onClick={() => onChangeView(VIEWS.original)}
                margin="small"
                color="accent"
              />
              <Button
                data-test-id="show-new"
                disabled={!canShow.new}
                border="vertical"
                label="New"
                active={view === VIEWS.new}
                onClick={() => onChangeView(VIEWS.new)}
                margin="small"
                color="accent"
              />
              <Button
                data-test-id="show-both"
                disabled={!canShow.both}
                label="Difference"
                border="right"
                active={view === VIEWS.both}
                onClick={() => onChangeView(VIEWS.both)}
                margin="small"
                color="accent"
              />
            </React.Fragment>
          )}
        </Box>
      );
    };

    const [dropOpen, setDropOpen] = useState(false);
    const renderDropdownMenu = () => {
      const url = `/snapshots/history/${snapshot.projectId}/${btoa(
        snapshot.title,
      )}/${snapshot.width}/${snapshot.browser}`;
      return (
        <DropButton
          data-test-id="snapshot-dropdown"
          margin={{ horizontal: 'small' }}
          dropContent={
            <Box>
              <Button
                data-test-id="view-snapshot-history"
                hoverIndicator="background"
                href={url}
              >
                <Box
                  margin={{ vertical: 'small', horizontal: 'medium' }}
                  direction="row"
                  align="center"
                  gap="small"
                >
                  <History />
                  <Text size="small">View snapshot history</Text>
                </Box>
              </Button>
            </Box>
          }
          open={dropOpen}
          onClose={() => setDropOpen(false)}
          onOpen={() => setDropOpen(true)}
          dropAlign={{ top: 'bottom', left: 'left' }}
        >
          <Box align="center">
            <Ellipsis />
          </Box>
        </DropButton>
      );
    };

    const renderInfo = size => {
      const props = {};
      if (size === 'small') {
        props.fill = 'horizontal';
        props.justify = 'center';
      } else {
        props.basis = '1/3';
        props.justify = 'end';
      }
      return (
        <Box direction="row" align="center" {...props} wrap>
          {showingMoreThanOne && renderDropdownMenu()}
          {showingMoreThanOne && getBrowserType(snapshot.browser)}
          <Box title="width">
            <Header>{snapshot.width}px</Header>
          </Box>
          <Box direction="row" margin={{ right: 'small' }}>
            {renderShrinkButton()}
            {renderExpandButton()}
            {renderFlakeButton()}
          </Box>
          <Box>
            {renderApproveButton()}
            {!showingMoreThanOne && renderShowMoreButton()}
          </Box>
        </Box>
      );
    };

    const top = !canExpand ? '0' : '72px';

    return (
      <ResponsiveContext.Consumer>
        {size => (
          <StickyBox
            id="snapshot-info"
            direction="row"
            justify="between"
            align="center"
            background="white"
            wrap
            border="bottom"
            top={top}
            unstick={size === 'small'}
          >
            {renderTitle(size)}
            {renderViewButtons(size)}
            {renderInfo(size)}
          </StickyBox>
        )}
      </ResponsiveContext.Consumer>
    );
  },
);

SnapshotHeader.propTypes = {
  group: PropTypes.shape({
    snapshots: PropTypes.shape({
      totalCount: PropTypes.number.isRequired,
    }).isRequired,
  }),
  snapshot: PropTypes.object.isRequired,
  isApproving: PropTypes.bool.isRequired,
  canAddFlake: PropTypes.bool,
  canShrink: PropTypes.bool.isRequired,
  canExpand: PropTypes.bool.isRequired,
  index: PropTypes.number,
  type: PropTypes.string,
  view: PropTypes.number.isRequired,
  onShrink: PropTypes.func.isRequired,
  onExpand: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onApproveGroup: PropTypes.func.isRequired,
  onChangeView: PropTypes.func.isRequired,
  onToggleFlake: PropTypes.func,
};

SnapshotHeader.defaultProps = {
  canAddFlake: false,
  showingMoreThanOne: true,
  onToggleFlake: () => {},
  onApproveGroup: () => {},
};
export default SnapshotHeader;

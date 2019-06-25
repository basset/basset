import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from 'grommet';
import {
  Clock,
  Tree,
  StatusGood,
  StatusCritical,
  StatusPlaceholder,
} from 'grommet-icons';
import moment from 'moment';

import Link from '../../../components/Link/Link.jsx';
import Tooltip from '../../../components/Tooltip/Tooltip.jsx';

export default class Build extends React.PureComponent {
  static propTypes = {
    build: PropTypes.object.isRequired,
    active: PropTypes.bool.isRequired,
    onChangeBuild: PropTypes.func.isRequired,
  };

  componentDidMount() {
    if (this.props.active) {
      const el = document.getElementById(this.props.build.id);
      if (el) {
        el.scrollIntoView();
      }
    }
  }

  statusColor = build => {
    if (build.completedAt) {
      if (
        build.totalSnapshots === build.approvedSnapshots ||
        build.changedSnapshots === 0
      ) {
        return 'accent';
      }
      return 'accent-1';
    }
    if (build.cancelledAt) {
      return 'status-warning';
    }
    if (build.error) {
      return 'status-critical';
    }
    return 'status-unknown';
  };

  renderStatus = build => {
    if (build.completedAt) {
      return <StatusGood color="accent" />;
    }
    if (build.cancelledAt) {
      return <StatusCritical color="status-warning" />;
    }

    if (build.error) {
      return <StatusCritical color="status-error" />
    }
    return <StatusPlaceholder color="status-unknown" />;
  };

  formatDate = dateStr => {
    const date = moment(parseInt(dateStr));
    const months = date.diff(moment(), 'months');
    const includeDate = months > 1;
    return `${date.fromNow()}${includeDate ? date.format('YYYY-DD-MM') : ''}`;
  };

  buildTimedOut = build => {
    return build.error && !build.submittedAt;
  }

  buildIncompleteSnapshots = build => build.error && !build.completedAt;

  renderBuildTime = build => {
    let text;
    if (this.buildTimedOut(build)) {
      return `Build was not fully submitted`;
    } else if (build.completedAt) {
      const completedAt = moment(parseInt(build.completedAt));
      const submittedAt = moment(parseInt(build.submittedAt));
      const buildTime = `${completedAt.from(submittedAt, true)}`;
      text = `Finished ${this.formatDate(
        build.completedAt,
      )} (build time ${buildTime})`;
    } else if (build.cancelledAt) {
      text = `Cancelled ${this.formatDate(build.cancelledAt)}`;
    } else if (this.buildIncompleteSnapshots(build)) {
        return 'Snapshot rendering and comparison did not complete';
    } else if (build.submittedAt) {
      text = `Submitted ${this.formatDate(build.submittedAt)}`;
    } else if (build.createdAt) {
      text = `Started ${this.formatDate(build.createdAt)}`;
    }

    return (
      <React.Fragment>
        <Clock />
        <Text margin="xsmall">{text}</Text>
      </React.Fragment>
    );
  };

  renderTooltip = () => {
    const { build } = this.props;
    const commitSha = build.commitSha ? build.commitSha.slice(0, 7) : '';
    return (
      <Box background="dark-1" pad="xsmall" style={{ whiteSpace: 'pre-line' }}>
        <Text size="small">{build.commitMessage}</Text>
        <Text size="small">
          By: {build.authorName} {moment(parseInt(build.authorDate)).fromNow()}
        </Text>
        <Text size="small">Commit: {commitSha}</Text>
      </Box>
    );
  };

  renderSnapshotInfo = () => {
    const { build } = this.props;
    if (
      build.modifiedSnapshots &&
      build.approvedSnapshots !== build.modifiedSnapshots
    ) {
      return (
        <Text size="small">
          {build.approvedSnapshots} of {build.modifiedSnapshots} approved
        </Text>
      );
    }
    if (build.newSnapshots) {
      return <Text size="small">{build.newSnapshots} new snapshots</Text>;
    }
    if (build.removedSnapshots) {
      return (
        <Text size="small">{build.removedSnapshots} snapshots removed</Text>
      );
    }
    if (build.approvedSnapshots === build.modifiedSnapshots) {
      return (
        <Box direction="row" gap="small" align="center">
          <Text size="small">Snapshots</Text>
          <StatusGood color="accent" />
        </Box>
      );
    }
  };

  render() {
    const { build } = this.props;
    const buildInfo = (
      <Box
        id={build.id}
        border={{
          side: 'left',
          color: this.statusColor(build),
          size: 'large',
        }}
        pad="small"
        fill
        direction="row"
        wrap
        align="center"
      >
        <Box pad="small">
          <Text>Build #{build.number}</Text>
        </Box>
        <Box
          direction="column"
          margin={{
            left: 'small',
          }}
          pad={{
            horizontal: 'small',
          }}
          flex
          basis="auto"
        >
          <Box align="center" direction="row">
            <Tree />
            <Tooltip label={this.renderTooltip()}>
              <Tooltip.UnderlinedText margin="xsmall">
                {build.branch}
              </Tooltip.UnderlinedText>
            </Tooltip>
          </Box>
          <Box align="center" direction="row">
            {this.renderBuildTime(build)}
          </Box>
        </Box>
        {build.completedAt && (
          <Box
            direction="column"
            align="center"
            justify="center"
            pad="small"
            fill="vertical"
          >
            {this.renderSnapshotInfo()}
          </Box>
        )}
        <Box
          direction="column"
          align="start"
          margin={{
            left: 'medium',
          }}
        >
          <Box fill direction="row" align="center" gap="small">
            <Text size="small">Build</Text>
            {this.renderStatus(build)}
          </Box>
        </Box>
      </Box>
    );
    return (
      <Box elevation="xsmall" margin="xsmall" id={build.id} flex="grow">
        {build.completedAt ? (
          <Link.Button
            href={`/builds/${build.id}`}
            onClick={() => this.props.onChangeBuild(build)}
            hoverIndicator="background"
          >
            {buildInfo}
          </Link.Button>
        ) : (
          <Box>{buildInfo}</Box>
        )}
      </Box>
    );
  }
}

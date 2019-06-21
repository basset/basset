import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box, Heading } from 'grommet';
import { Tree } from 'grommet-icons';

import { getCurrentBuild } from '../../../redux/builds/selectors.js';

import SnapshotSearch from './SnapshotSearch.jsx';
import SnapshotList from './SnapshotList.jsx';
import SnapshotGroups from './SnapshotGroups.jsx';
import ScrollUpButton from '../../../components/ScrollUpButton/ScrollUpButton.jsx';

class Snapshots extends React.PureComponent {
  static propTypes = {
    build: PropTypes.object.isRequired,
  };

  renderBuildInfo(build) {
    return (
      <Box flex justify="center" direction="row">
        <Heading size="small" level={4}>
          <Box align="center" direction="row" gap="small">
            <Tree />
            {build.branch}
          </Box>
        </Heading>
      </Box>
    );
  }

  render() {
    return (
      <Box flex="grow" width="100%">
        <ScrollUpButton />
        <Box direction="row" align="center" border={{ side: 'bottom' }}>
          <Box
            flex={this.props.build.previousBuild !== null}
            direction="row"
            align="center"
          >
            <Heading level={2}>#{this.props.build.number}</Heading>
            {this.props.build.previousBuild &&
              this.renderBuildInfo(this.props.build.previousBuild)}
          </Box>
          {this.props.build.previousBuild && (
            <Box border={{ side: 'right' }} width="0px">
              &nbsp;
            </Box>
          )}
          {this.renderBuildInfo(this.props.build)}
        </Box>
        <SnapshotSearch />
        <SnapshotList type="flake" typeName="Snapshot flakes" />
        <SnapshotGroups />
        <SnapshotList type="new" typeName="New snapshots" />
        <SnapshotList type="unmodified" typeName="Unmodified snapshots" />
        <SnapshotList type="removed" typeName="Removed snapshots" />
      </Box>
    );
  }
}

const mapState = state => {
  return {
    build: getCurrentBuild(state),
  };
};

export default connect(
  mapState,
  null,
)(Snapshots);

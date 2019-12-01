import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box, Button, Text } from 'grommet';
import { StatusWarning, Update } from 'grommet-icons';

import {
  getBuilds,
  getCurrentBuild,
  getHasNextPage,
  getIsLoading,
  getIsLoadingMore,
} from '../../../redux/builds/selectors.js';
import { getCurrentOrganization } from '../../../redux/organizations/selectors.js';

import { changeBuild, getBuilds as reloadBuilds, loadMore, setCurrentBuild } from '../../../redux/builds/actions.js';
import LoadMoreButton from '../../../components/LoadMoreButton/LoadMoreButton.jsx';

import LoadingBox, { Progress } from '../../../components/LoadingBox/LoadingBox.jsx';
import Build from './Build.jsx';
import Link from '../../../components/Link/Link.jsx';

export class Builds extends React.PureComponent {
  static propTypes = {
    organization: PropTypes.object.isRequired,
    builds: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
      }).isRequired,
    ),
    currentBuild: PropTypes.shape({
      id: PropTypes.string.siRequired,
    }),
    onChangeBuild: PropTypes.func.isRequired,
    onReload: PropTypes.func.isRequired,
  };

  static defaultProps = {
    builds: [],
  };

  get hasBuilds() {
    return this.props.builds.length > 0;
  }

  get snapshotsExceeded() {
    const { organization } = this.props;
    return organization.enforceSnapshotLimit && organization.currentSnapshotCount >= organization.monthlySnapshotLimit;
  }

  get currentBuildId() {
    return this.props.currentBuild ? this.props.currentBuild.id : null;
  }

  render() {
    if (this.props.isLoading) {
      return (
        <Box fill direction="column" margin="none">
          <Button
            alignSelf="end"
            icon={<Update />}
            onClick={this.props.onReload}
            disabled={this.props.isLoading}
          />
          {Array(5)
            .fill()
            .map((_, index) => (
              <Progress key={index}>
                <LoadingBox
                  elevation="xsmall"
                  margin="xsmall"
                  flex="grow"
                  height="xsmall"
                  background="white"
                />
              </Progress>
            ))}
        </Box>
      );
    }
    return (
      <Box fill direction="column" margin="none">
        {this.snapshotsExceeded && (
          <Box border={{color: 'status-warning', size: 'medium'}} round size="small" pad="medium" align="center">
            <Box direction="row" align="center" gap="small">
              <StatusWarning color="status-warning" />
              <Text size="medium">You have reached the monthly limit for builds & snapshots.</Text>
            </Box>
            <Link href="/organizations" color="dark-2" label="Monthly limits" />
          </Box>
        )}
        <Button
          alignSelf="end"
          icon={<Update />}
          onClick={this.props.onReload}
          disabled={this.props.isLoading}
        />
        {this.hasBuilds && (
          <Box>
            {this.props.builds.map(build => (
              <Build
                key={build.id}
                build={build}
                onChangeBuild={this.props.onChangeBuild}
                active={this.currentBuildId === build.id}
              />
            ))}
          </Box>
        )}
        {!this.hasBuilds && (
          <Box
            data-test-id="no-builds"
            gap="large"
            margin="small"
            align="center"
          >
            <Text>
              This project does not have any builds associated with it
            </Text>
          </Box>
        )}
        {this.props.hasNextPage && (
          <Box align="center" margin="small">
            <LoadMoreButton
              isLoadingMore={this.props.isLoadingMore}
              onLoadMore={this.props.onLoadMore}
            />
          </Box>
        )}
      </Box>
    );
  }
}

const mapState = state => ({
  isLoading: getIsLoading(state),
  isLoadingMore: getIsLoadingMore(state),
  hasNextPage: getHasNextPage(state),
  builds: getBuilds(state),
  currentBuild: getCurrentBuild(state),
  organization: getCurrentOrganization(state),
});

const mapAction = dispatch => ({
  onReload: () => {
    dispatch(setCurrentBuild(null));
    dispatch(reloadBuilds());
  },
  onChangeBuild: build => dispatch(changeBuild(build)),
  onLoadMore: () => dispatch(loadMore()),
});

export default connect(
  mapState,
  mapAction,
)(Builds);

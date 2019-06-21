import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box, Text, Button } from 'grommet';
import { Update } from 'grommet-icons';

import {
  getBuilds,
  getIsLoading,
  getIsLoadingMore,
  getHasNextPage,
  getCurrentBuild,
} from '../../../redux/builds/selectors.js';
import {
  changeBuild,
  loadMore,
  setCurrentBuild,
  getBuilds as reloadBuilds,
} from '../../../redux/builds/actions.js';

import LoadMoreButton from '../../../components/LoadMoreButton/LoadMoreButton.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
import LoadingBox, {
  Progress,
} from '../../../components/LoadingBox/LoadingBox.jsx';

import Build from './Build.jsx';

export class Builds extends React.PureComponent {
  static propTypes = {
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
        {this.hasBuilds && (
          <React.Fragment>
            <Button
              alignSelf="end"
              icon={<Update />}
              onClick={this.props.onReload}
              disabled={this.props.isLoading}
            />
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
          </React.Fragment>
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

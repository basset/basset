import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box, Button, Form, FormField } from 'grommet';

import ApolloClient from '../../../graphql/client.js';
import SnapshotsQuery from '../../../graphql/query/getSnapshots.js';
import { getIsApproving } from '../../../redux/snapshots/selectors.js';
import {
  showSnapshot,
  approveSnapshot,
} from '../../../redux/snapshots/actions.js';
import { getCurrentBuild } from '../../../redux/builds/selectors.js';

import Snapshot from './Snapshot.jsx';
import SnapshotType from './SnapshotType.jsx';
import FoundSnapshots from './FoundSnapshots.jsx';
import Notification from '../../../components/Notification/Notification.jsx';

class SnapshotsSearch extends React.PureComponent {
  state = {
    foundSnapshots: null,
    searchTitle: '',
    isSearching: false,
    error: '',
  };

  handleChangeSearchTitle = event => {
    const value = event.target.value;
    this.setState(state => ({
      ...state,
      searchTitle: value,
    }));
  };

  handleClearSearchResults = () => {
    this.setState(state => ({
      ...state,
      foundSnapshots: null,
    }));
  };

  handleSearch = async () => {
    if (this.state.isSearching || this.state.searchTitle.trim() === '') {
      return;
    }
    this.setState(state => ({
      ...state,
      isSearching: true,
    }));
    try {
      const {
        data: { snapshots },
      } = await ApolloClient.query({
        query: SnapshotsQuery,
        variables: {
          buildId: this.props.build.id,
          first: 100,
          title: this.state.searchTitle,
        },
      });
      this.setState(state => ({
        ...state,
        foundSnapshots: snapshots.edges.map(e => e.node),
        isSearching: false,
      }));
    } catch (error) {
      console.log(error);
      this.setState(state => ({
        ...state,
        error,
        isSearching: false,
        foundSnapshots: null,
      }));
    }
  };
  render() {
    return (
      <React.Fragment>
        <Box margin={{ vertical: 'small' }} alignSelf="end">
          {this.state.error && (
            <Notification
              type="error"
              error={this.state.error}
              message="There was an error searching"
            />
          )}
          <Form onSubmit={this.handleSearch}>
            <Box direction="row" align="center" width="medium">
              <Box flex>
                <FormField
                  data-test-id="search-input"
                  size="small"
                  label="Search for snapshots title"
                  value={this.state.searchTitle}
                  onChange={this.handleChangeSearchTitle}
                />
              </Box>
              <Box>
                <Button
                  data-test-id="submit-search"
                  size="small"
                  type="submit"
                  label="Search"
                  disabled={this.state.isSearching}
                />
              </Box>
            </Box>
          </Form>
        </Box>
        <FoundSnapshots
          foundSnapshots={this.state.foundSnapshots}
          onClearSearchResults={this.handleClearSearchResults}
          isSearching={this.state.isSearching}
        />
      </React.Fragment>
    );
  }
}

const mapState = state => {
  return {
    build: getCurrentBuild(state),
    isApproving: getIsApproving(state),
  };
};

const mapAction = dispatch => ({
  onExpand: snapshot => dispatch(showSnapshot(snapshot)),
  onApproveSnapshot: snapshot => dispatch(approveSnapshot(snapshot)),
});

export default connect(
  mapState,
  mapAction,
)(SnapshotsSearch);

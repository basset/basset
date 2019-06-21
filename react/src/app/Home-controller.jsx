import React from 'react';
import { connect } from 'react-redux';

import { getUser } from '../redux/user/selectors.js';
import {
  getOrganizations,
  getIsLoading,
} from '../redux/organizations/selectors.js';

import Layout from '../components/Layout/Layout-redux.jsx';
import Projects from './projects/components/Projects.jsx';
import HomePage from './Home.jsx';

export class Home extends React.PureComponent {
  render() {
    let sidebar = false;
    if (!this.props.hideSidebar && this.props.hasOrganization) {
      if (this.props.sidebar) {
        sidebar = this.props.sidebar;
      } else {
        sidebar = this.props.hasOrganization ? <Projects /> : false;
      }
    }
    if (this.props.isLoading) {
      return <Layout sidebar={sidebar} />;
    }
    return (
      <Layout sidebar={sidebar}>
        <HomePage
          user={this.props.user}
          hasOrganization={this.props.hasOrganization}
          children={this.props.children}
        />
      </Layout>
    );
  }
}

const mapState = state => ({
  user: getUser(state),
  hasOrganization: getOrganizations(state).length > 0,
  isLoading: getIsLoading(state),
});

export default connect(
  mapState,
  null,
)(Home);

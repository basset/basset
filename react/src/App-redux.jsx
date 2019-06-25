import { connect } from 'react-redux';

import App from './App.jsx';

import { getComponent, getIsNavigating } from './redux/router/selectors.js';

const mapStateToProps = state => ({
  component: getComponent(state),
  isNavigating: getIsNavigating(state),
});

export default connect(
  mapStateToProps,
  null,
)(App);

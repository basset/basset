import { connect } from 'react-redux';

import ErrorBoundary from './ErrorBoundary.jsx';

import { getError } from '../../redux/user/selectors.js';

const mapStateToProps = state => ({
  error: getError(state),
});

export default connect(
  mapStateToProps,
  null,
)(ErrorBoundary);

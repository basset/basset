import { connect } from 'react-redux';

import OrganizationSwitcher from './OrganizationSwitcher.jsx';

import {
  getCurrentOrganization,
  getOrganizations,
} from '../../redux/organizations/selectors.js';
import { changeOrganization } from '../../redux/organizations/actions.js';

const mapStateToProps = state => ({
  organizations: getOrganizations(state),
  organization: getCurrentOrganization(state) || '',
});

const mapActions = dispatch => ({
  onChangeOrganization: organization =>
    dispatch(changeOrganization(organization)),
});

export default connect(
  mapStateToProps,
  mapActions,
)(OrganizationSwitcher);

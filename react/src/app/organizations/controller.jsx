import React from 'react';
import { connect } from 'react-redux';

import {
  getCurrentOrganization,
  getIsLoading,
  getIsUpdating,
  getError,
} from '../../redux/organizations/selectors.js';
import { saveOrganization } from '../../redux/organizations/actions.js';
import { getUser } from '../../redux/user/selectors.js';

import Organization from './Organization.jsx';
import Members from './members/controller.jsx';
import Loader from '../../components/Loader/Loader.jsx';

const OrganizationController = React.memo(
  ({ error, isUpdating, isLoading, user, organization, onSaveName }) => {
    if (isLoading) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <Organization
          organization={organization}
          user={user}
          onSaveName={onSaveName}
          error={error}
          isUpdating={isUpdating}
        />
        <Members />
      </React.Fragment>
    );
  },
);

const mapState = state => ({
  isLoading: getIsLoading(state),
  isUpdating: getIsUpdating(state),
  user: getUser(state),
  organization: getCurrentOrganization(state),
  error: getError(state),
});

const mapActions = dispatch => ({
  onSaveName: name => dispatch(saveOrganization({ name })),
});
export default connect(
  mapState,
  mapActions,
)(OrganizationController);

import ApolloClient from '../graphql/client.js';

import getUserQuery from '../graphql/query/getUser.js';
import { loginUser } from '../redux/user/actions.js';
import { getIsAuthenticated } from '../redux/user/selectors.js';

export default async ({ next }, params, history, dispatch, getState) => {
  let isAuthenticated = getIsAuthenticated(getState());

  const redirect = {
    redirect: '/login',
  };

  if (!isAuthenticated) {
    await dispatch(verify());
    isAuthenticated = getIsAuthenticated(getState());
    if (!isAuthenticated) {
      return redirect;
    }
    return next();
  }
  return next();
};

export const verify = () => async dispatch => {
  try {
    const { data } = await ApolloClient.query({
      query: getUserQuery,
    });
    if (!data.whoami) {
      return false;
    }

    await dispatch(loginUser(data.whoami));

    return true;
  } catch (error) {
    return false;
  }
};

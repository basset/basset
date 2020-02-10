import queryString from 'query-string';

import { configureRouter } from '../../router.js';
import { history } from '../../history.js';
import * as actionTypes from './action-types.js';

export const setError = error => ({
  type: actionTypes.setError,
  error,
});

export const isNavigating = () => ({ type: actionTypes.isNavigating });

export const doneNavigating = () => ({ type: actionTypes.doneNavigating });

export const setComponent = component => ({
  type: actionTypes.setComponent,
  component,
});

export const setRouter = router => ({
  type: actionTypes.setRouter,
  router,
});

export const setupRouter = (routes) => async (dispatch, getState) => {
  const router = configureRouter(routes, history, dispatch, getState);
  dispatch(setRouter(router));
  history.listen((location, action) => {
    dispatch(locationChange(location, action));
  });
  history.replace(history.location);
};

export const locationChange = (location, action) => async (
  dispatch,
  getState,
) => {
  const pathname = location.pathname;
  const query = queryString.parse(location.search);
  const { router } = getState().router;
  try {
    dispatch(isNavigating());

    const route = await router.resolve({ pathname, query });
    if (route.redirect) {
      history.replace(route.redirect);
      return;
    }
    if (route.title) {
      document.title = route.title;
    }
    dispatch(setComponent(route.component));
    dispatch(doneNavigating());
  } catch (error) {
    dispatch(setError(error));
    dispatch(doneNavigating());
    throw error;
  }
};

export const goHome = () => {
  history.push('/');
};

export const goLogin = () => {
  history.push('/login');
};

export const navigateTo = path => {
  history.push(path);
};

import createReducer from '../create-reducer.js';
import * as actionTypes from './action-types';

const initialState = {
  router: null,
  isNavigating: false,
  component: null,
  error: '',
};

const handler = {
  [actionTypes.isNavigating]: state => ({
    ...state,
    isNavigating: true,
  }),
  [actionTypes.doneNavigating]: state => ({
    ...state,
    isNavigating: false,
  }),
  [actionTypes.setError]: (state, { error }) => ({
    ...state,
    error,
  }),
  [actionTypes.setRouter]: (state, { router }) => ({
    ...state,
    router,
  }),
  [actionTypes.setComponent]: (state, { component }) => ({
    ...state,
    component,
  }),
};

export default createReducer(initialState, handler);

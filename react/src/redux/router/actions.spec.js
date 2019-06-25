import * as actions from './actions';
jest.mock('../../history.js', () => ({
  history: {
    replace: jest.fn(),
    location: {
      pathname: '/',
    },
    listen: jest.fn(),
    push: jest.fn(),
  },
}));
import { configureRouter } from '../../router.js';
import { history } from '../../history.js';

let store;
beforeEach(() => {
  jest.resetModules();
  store = require('../store.js').default;
});

test('isNavigating', () => {
  store.dispatch(actions.isNavigating());
  const state = store.getState().router;
  expect(state.isNavigating).toBe(true);
});

test('doneNavigating', () => {
  store.dispatch(actions.doneNavigating());
  const state = store.getState().router;
  expect(state.isNavigating).toBe(false);
});

test('setError', () => {
  store.dispatch(actions.setError('uhoh'));
  const state = store.getState().router;
  expect(state.error).toBe('uhoh');
});

test('setRouter', () => {
  const obj = {};
  store.dispatch(actions.setRouter(obj));
  const state = store.getState().router;
  expect(state.router).toBe(obj);
});

test('setComponent', () => {
  const obj = {};
  store.dispatch(actions.setComponent(obj));
  const state = store.getState().router;
  expect(state.component).toBe(obj);
});

test('setupRouter', async () => {
  await store.dispatch(actions.setupRouter());
  const state = store.getState().router;
  expect(state.router).toBeDefined();
  expect(history.listen).toHaveBeenCalled();
  expect(history.replace).toHaveBeenCalled();
});

test('locationChange', async () => {
  const router = configureRouter(history, store.dispatch, store.getState);
  store.dispatch(actions.setRouter(router));
  const location = {
    pathname: '/forgot',
  };
  await store.dispatch(actions.locationChange(location));
  const state = store.getState().router;
  expect(state.component).not.toBe(null);
  expect(state.isNavigating).toBe(false);
});

test('locationChange error', async () => {
  const router = configureRouter(history, store.dispatch, store.getState);
  store.dispatch(actions.setRouter(router));
  try {
    const location = {};
    await store.dispatch(actions.locationChange(location));
  } catch (error) {
    const state = store.getState().router;
    expect(state.component).toBe(null);
    expect(state.error).not.toBe('');
    expect(state.isNavigating).toBe(false);
  }
});

test('goHome', async () => {
  actions.goHome();
  expect(history.push).toHaveBeenCalledWith('/');
});

test('goLogin', async () => {
  actions.goLogin();
  expect(history.push).toHaveBeenCalledWith('/login');
});

test('navigateTo', () => {
  actions.navigateTo('/here');
  expect(history.push).toHaveBeenCalledWith('/here');
});

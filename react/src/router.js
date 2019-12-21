import Router from 'universal-router';
import routes from './routes.js';
import verifyAuthenticated from './app/verify-authenticated.js';

export const configureRouter = (history, dispatch, getState) => {
  return new Router(routes, {
    async resolveRoute(context, params) {
      if (context.route.verifyAuthentication) {
        const verified = await verifyAuthenticated(context, params, history, dispatch, getState);
        if (verified !== true) {
          return verified;
        }
      }
      if (typeof context.route.load === 'function') {
        const action = await context.route.load();
        return action.default(context, params, history, dispatch, getState);
      }
      if (typeof context.route.action === 'function') {
        return context.route.action(
          context,
          params,
          history,
          dispatch,
          getState,
        );
      }
      if (context.route.redirect) {
        return context.route;
      }
      return;
    },
  });
};

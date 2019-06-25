import Router from 'universal-router';
import routes from './routes.js';

export const configureRouter = (history, dispatch, getState) => {
  return new Router(routes, {
    resolveRoute(context, params) {
      if (typeof context.route.load === 'function') {
        return context.route
          .load()
          .then(action =>
            action.default(context, params, history, dispatch, getState),
          );
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

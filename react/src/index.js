import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import store from './redux/store.js';
import { setupRouter } from './redux/router/actions.js';
import * as serviceWorker from './serviceWorker';

import routes from './routes.js';
import App from './App-redux.jsx';
import initializePlugins from './plugins';
import * as pluginOptions from './plugin-options.js';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);

serviceWorker.unregister();
initializePlugins({
  routes,
  pluginOptions,
  store,
}).then(() => {
  store.dispatch(setupRouter(routes));
}).catch(() => {
  console.log('Error loading plugins');
});


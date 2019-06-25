import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import store from './redux/store.js';
import { setupRouter } from './redux/router/actions.js';
import * as serviceWorker from './serviceWorker';
import App from './App-redux.jsx';

store.dispatch(setupRouter());

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);

serviceWorker.unregister();

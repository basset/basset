import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import reducer from './reducer';

const composeEnhancers = composeWithDevTools({ name: 'Basset' });

const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));

export default store;

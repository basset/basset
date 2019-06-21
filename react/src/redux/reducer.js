import { combineReducers } from 'redux';

import router from './router/reducer.js';
import user from './user/reducer.js';
import organizations from './organizations/reducer.js';
import projects from './projects/reducer.js';
import builds from './builds/reducer.js';
import snapshots from './snapshots/reducer.js';

export default combineReducers({
  router,
  user,
  organizations,
  projects,
  builds,
  snapshots,
});

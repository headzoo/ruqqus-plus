import { combineReducers } from 'redux';
import user from './userReducer';

// eslint-disable-next-line no-unused-vars
function lastAction(state = null, action) {
  return action;
}

/**
 * @returns {*}
 */
export default function createRootReducer() {
  return combineReducers({
    user,
    lastAction
  });
}

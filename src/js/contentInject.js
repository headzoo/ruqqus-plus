import actions from './actions';

/**
 * This page is injected into ruqqus. Unlike contentScript.js, this script
 * has access to the window object, which contains ruqqus functions and variables.
 */

const loadedActions = {};
Object.keys(actions).forEach((key) => {
  const action = new actions[key]();
  action.execWindowContext();
  loadedActions[key] = action;
});

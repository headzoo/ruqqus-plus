import actions from './actions';

/**
 * This page gets injected into ruqqus. Unlike contentScript.js, this script
 * has access to the window object, which contains ruqqus functions and variables
 * which some actions/modules might need.
 */

const actionObjects = {};
Object.keys(actions).forEach((key) => {
  const action = new actions[key]();
  action.execWindowContext();
  actionObjects[key] = action;
});

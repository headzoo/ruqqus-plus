import actions from './actions';

chrome.runtime.onInstalled.addListener(() => {
  Object.keys(actions).forEach((key) => {
    const action = new actions[key]();
    action.onInstalled();
  });
});

const actionObjects = {};
Object.keys(actions).forEach((key) => {
  const action = new actions[key]();
  action.execBackgroundContext();
  actionObjects[key] = action;
});

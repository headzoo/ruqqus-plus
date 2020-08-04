import { createStore } from 'redux';
import { wrapStore } from 'webext-redux';
import actions from './actions';
import createRootReducer from './redux/reducers/rootReducer';

const store = createStore(createRootReducer(), {});
wrapStore(store);

chrome.runtime.onInstalled.addListener(() => {
  Object.keys(actions).forEach((key) => {
    const action = new actions[key]();
    action.onInstalled();
  });
});

const actionObjects = {};
Object.keys(actions).forEach((key) => {
  const action = new actions[key]();
  action.execBackgroundContext(store);
  actionObjects[key] = action;
});

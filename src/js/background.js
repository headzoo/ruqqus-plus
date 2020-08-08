import { createStore } from 'redux';
import { wrapStore } from 'webext-redux';
import controllers from './controllers';
import createRootReducer from './redux/reducers/rootReducer';

const store = createStore(createRootReducer(), {});
wrapStore(store);

chrome.runtime.onInstalled.addListener(() => {
  Object.keys(controllers).forEach((key) => {
    const c = new controllers[key]();
    c.onInstalled();
  });
});

const controllerObjs = {};
Object.keys(controllers).forEach((key) => {
  const c = new controllers[key]();
  c.execBackgroundContext(store);
  controllerObjs[key] = c;
});

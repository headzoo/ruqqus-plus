import { injectScript } from './utils/web';
import actions from './actions';

// All of the extension functionality is encapsulated in actions. The
// ModuleAction initializes modules.
const actionObjects = {};
Object.keys(actions).forEach((key) => {
  const action = new actions[key]();
  action.execContentContext();
  actionObjects[key] = action;
});

// contentInject.js has access to the ruqqus window object, which is needed
// to access ruqqus functions and variables. (This script cannot access them.)
injectScript(chrome.extension.getURL('js/contentInject.js'));

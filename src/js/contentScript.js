import { injectScript } from './utils/web';
import modules from './modules';
import actions from './actions';

// contentInject.js has access to the ruqqus window object, which is needed
// to access ruqqus functions and variables. (This script cannot access them.)
injectScript(chrome.extension.getURL('js/contentInject.js'));

// Loads the activated modules.
chrome.storage.sync.get('settings', (value) => {
  const { settings } = value;

  const actionModules = {};
  Object.keys(settings).forEach((key) => {
    const mod = new modules[key]();
    mod.execContentContext();
    actionModules[key] = mod;
  });

  const activeActions = {};
  Object.keys(actions).forEach((key) => {
    const action = new actions[key]();
    action.execContentContext();
    activeActions[key] = action;
  });

  // Let the contentInject.js script know which modules are active.
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('rp.modulesReady', {
      'detail': {
        activeModules: Object.keys(actionModules),
        activeActions: Object.keys(activeActions)
      }
    }));
  }, 2000);
});

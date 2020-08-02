import { injectScript } from './utils/web';
import modules from './modules';

// contentInject.js has access to the ruqqus window object, which is needed
// to access ruqqus functions and variables. (This script cannot access them.)
injectScript(chrome.extension.getURL('js/contentInject.js'));

// Loads the activated modules.
chrome.storage.sync.get('settings', (value) => {
  const { settings } = value;

  const activeMods = [];
  Object.keys(settings).forEach((key) => {
    modules[key].execContent();
    activeMods.push(key);
  });

  // Let the contentInject.js script know which modules are active.
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('rp.modulesReady', {
      'detail': {
        activeMods
      }
    }));
  }, 2000);
});

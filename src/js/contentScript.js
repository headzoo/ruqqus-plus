import { injectScript } from './utils/web';
import modules from './modules';

// contentInject.js has access to the ruqqus window object, which is needed
// to access ruqqus functions and variables. (This script cannot access them.)
injectScript(chrome.extension.getURL('js/contentInject.js'));

// Loads the activated modules.
chrome.storage.sync.get('settings', (value) => {
  const { settings } = value;

  const loaded = {};
  Object.keys(settings).forEach((key) => {
    const mod = new modules[key]();
    mod.execContentContext();
    loaded[key] = mod;
  });

  // Let the contentInject.js script know which modules are active.
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('rp.modulesReady', {
      'detail': {
        activeMods: Object.keys(loaded)
      }
    }));
  }, 2000);
});

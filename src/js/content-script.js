import { injectScript } from './utils/web';
import controllers from './controllers';

// All of the extension functionality is encapsulated in controllers. The
// ModuleController initializes modules.
const controllerObjects = {};
Object.keys(controllers).forEach((key) => {
  const c = new controllers[key]();
  c.execContentContext();
  controllerObjects[key] = c;
});

// contentInject.js has access to the ruqqus window object, which is needed
// to access ruqqus functions and variables. (This script cannot access them.)
let injected = false;
document.addEventListener('DOMContentLoaded', () => {
  if (!injected) {
    injected = true;
    injectScript(chrome.extension.getURL('js/content-inject.js'));
  }
});

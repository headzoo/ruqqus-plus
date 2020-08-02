import { injectScript } from './utils/web';
import modules from './modules';

injectScript(chrome.extension.getURL('js/contentInject.js'), 'body');

chrome.storage.sync.get('settings', (value) => {
    const { settings } = value;

    const activeMods = [];
    Object.keys(settings).forEach((key) => {
        modules[key].execContent();
        activeMods.push(key);
    });

    // Let the contentInject.js script know which modules are active.
    setTimeout(() => {
        document.dispatchEvent(new CustomEvent('rp.activeMods', {
            'detail': {
                activeMods
            }
        }));
    }, 2000);
});

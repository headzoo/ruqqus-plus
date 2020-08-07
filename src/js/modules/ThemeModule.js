import Module from './Module';
import ThemeModuleSettings from './components/ThemeModuleSettings';
import { injectCSS } from '../utils/web';

/**
 * Opens posts in a new tab.
 */
export default class ThemeModule extends Module {
  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {boolean}
   */
  static getDefaultSetting = () => {
    return true;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'Enable themes';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Themes are user sharable content that changes the look of ruqqus.';
  };

  /**
   * All modules have on/off checkboxes on the extension settings page, but
   * modules may also have advanced settings which are reachable from the
   * settings page sidebar. This method returns the label used in the sidebar.
   *
   * @returns {string} Return a falsy value when the module does not have settings
   */
  getSettingsSidebarLabel = () => {
    return 'Themes';
  };

  /**
   * Returns the advanced settings form when applicable. The method must return
   * a React component.
   *
   * @returns {*}
   */
  getSettingsComponent = () => {
    return ThemeModuleSettings;
  }

  /**
   * Called when the extension is installed
   */
  onInstalled = () => {
    ThemeModule.getDatabase()
      .then((db) => {
        const tx    = db.transaction(['themes'], 'readwrite');
        const store = tx.objectStore('themes');
        const json  = require('./data/spacy.json'); // eslint-disable-line
        store.add(json);
      });
  }

  /**
   * Called from the extension content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object. For example you can't access
   * window.upvote() from here.
   *
   * This is usually where your code will go.
   */
  execContentContext = () => {
    const port = chrome.runtime.connect({
      name: 'ThemeModule'
    });
    port.postMessage({ event: 'rq.getActiveTheme' });
    port.onMessage.addListener((msg) => {
      if (msg.event && msg.event === 'rq.getActiveTheme' && msg.css) {
        injectCSS(msg.css);
      }
    });
  };

  /**
   * Called from the background script
   */
  execBackgroundContext = () => {
    chrome.runtime.onConnect.addListener((port) => {
      port.onMessage.addListener((msg) => {
        if (msg.event && msg.event === 'rq.getActiveTheme') {
          ThemeModule.getDatabase()
            .then((db) => {
              const tx    = db.transaction(['themes'], 'readwrite');
              const store = tx.objectStore('themes');
              const req   = store.getAll();

              req.onsuccess = (e) => {
                const themes = e.target.result;
                if (themes) {
                  for (let i = 0; i < themes.length; i++) {
                    if (themes[i].active) {
                      port.postMessage({
                        css:   themes[i].css,
                        event: 'rq.getActiveTheme'
                      });
                      break;
                    }
                  }
                }
              };
            });
        }
      });
    });
  };

  /**
   * @returns {Promise<IDBDatabase>}
   */
  static getDatabase = () => {
    return new Promise((resolve) => {
      const dbReq = indexedDB.open('ThemeModule', 5);
      dbReq.onupgradeneeded = (e) => {
        e.target.result.createObjectStore('themes', { keyPath: 'uuid' });
      };
      dbReq.onsuccess = (e) => {
        resolve(e.target.result);
      };
      dbReq.onerror = (e) => {
        this.toastError(`Error initializing theme module. ${e.target.errorCode}`);
      };
    });
  };
}

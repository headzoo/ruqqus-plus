import Module from './Module';
import ThemeModuleSettings from './ThemeModule/ThemeModuleSettings';
import firstTemplate from './ThemeModule/spacey.json';
import { injectCSS } from '../utils/web';
import { isDarkMode } from '../utils/ruqqus';

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
    return 'Themes';
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
        store.add(firstTemplate);
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
      if (msg.event && msg.event === 'rq.getActiveTheme') {
        injectCSS(msg.css);
        if (msg.dark_css && isDarkMode()) {
          injectCSS(msg.dark_css);
        }
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
                        css:      themes[i].css || '',
                        dark_css: themes[i].dark_css || '',
                        event:    'rq.getActiveTheme'
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
    return new Promise((resolve, reject) => {
      const dbReq = indexedDB.open('ThemeModule', 5);
      dbReq.onupgradeneeded = (e) => {
        e.target.result.createObjectStore('themes', { keyPath: 'uuid' });
      };
      dbReq.onsuccess = (e) => {
        resolve(e.target.result);
      };
      dbReq.onerror = (e) => {
        reject(new Error(`Error initializing theme module. ${e.target.errorCode}`));
      };
    });
  };
}

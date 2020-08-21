import Module from './Module';
import SettingsModal from './DefaultSortModule/SettingsModal';
import storage from '../utils/storage';
import defaultSettings from './DefaultSortModule/defaultSettings';

/**
 * Have guilds and comments sorted by top, new, hot, disputed by default
 */
export default class DefaultSortModule extends Module {
  /**
   * @type {{guildSort: string, commentsSort: string}}
   */
  settings = { ...defaultSettings };

  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {boolean}
   */
  static isEnabledByDefault = () => {
    return false;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'Default Sort';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Have guilds and comments sorted by top, new, hot, disputed by default.';
  };

  /**
   * Called when the user exports the extension data
   *
   * Should return all values that have been saved by the controller or module. Should
   * return a falsy value when the controller/module has nothing to export.
   *
   * @returns {Promise}
   */
  exportData = async () => {
    return storage.getNamespace('DefaultSortModule');
  };

  /**
   * Called when the user imports extension data
   *
   * Will receive the values saved for the controller or module.
   *
   * @param {*} data
   * @returns {Promise}
   */
  importData = async (data) => {
    return storage.setNamespace('DefaultSortModule', data);
  };

  /**
   * Returns a react component that will be displayed in a modal
   */
  getSettingsModal = () => {
    return SettingsModal;
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    storage.get('DefaultSortModule.settings', defaultSettings)
      .then((settings) => {
        this.settings = { ...defaultSettings, ...settings };

        this.listen('rp.change', this.wireupLinks);
        this.onDOMReady(this.wireupLinks);
      });
  };

  /**
   *
   */
  wireupLinks = () => {
    if (this.settings.guildSort !== defaultSettings.guildSort) {
      document.querySelectorAll('a')
        .forEach((a) => {
          const href = a.getAttribute('href');
          if (href && href.indexOf('/+') === 0) {
            const path = href.split('?').shift();
            a.setAttribute('href', `${path}?sort=${this.settings.guildSort}`);
          }
        });
    }

    if (this.settings.commentsSort !== defaultSettings.commentsSort) {
      document.querySelectorAll('a')
        .forEach((a) => {
          const href = a.getAttribute('href');
          if (href && href.indexOf('/post/') === 0) {
            const path = href.split('?').shift();
            a.setAttribute('href', `${path}?sort=${this.settings.commentsSort}`);
          }
        });
    }
  };
}

import Module from './Module';
import SettingsModal from './ChangeHomeLinkModule/SettingsModal';
import storage from '../utils/storage';

/**
 * Changes the url the ruqqus logo in the upper left hand corner links to
 */
export default class ChangeHomeLinkModule extends Module {
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
    return 'Change Home Link';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Changes the url the ruqqus logo in the upper left hand corner links to.';
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
    return storage.getNamespace('ChangeHomeLinkModule');
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
    return storage.setNamespace('ChangeHomeLinkModule', data);
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
    storage.get('ChangeHomeLinkModule.url', '/')
      .then((url) => {
        const brand = document.querySelector('.navbar-brand');
        if (brand) {
          brand.setAttribute('href', url);
        }
      });
  };
}

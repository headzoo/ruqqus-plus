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

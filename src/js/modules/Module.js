import Controller from '../controllers/Controller';

/**
 * Parent module class
 */
export default class Module extends Controller {
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
    throw new Error('getLabel not implemented.');
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return '';
  };

  /**
   * Returns a react component that will be displayed in a modal
   */
  getSettingsModal = () => {
  }
}

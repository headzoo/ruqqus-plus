import Controller from '../Controller';

/**
 * Parent action class
 */
export default class Action extends Controller {
  /**
   * @returns {string}
   */
  getLabel = () => {
    throw new Error('getLabel not implemented.');
  };

  /**
   * @returns {string}
   */
  getSettingsHtml = () => {
    return '';
  };

  /**
   *
   */
  onSettingsPageReady = () => {
  };
}

import Controller from '../utils/Controller';

/**
 * Parent module class
 */
export default class Module extends Controller {
  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    throw new Error('getLabel not implemented.');
  }
}

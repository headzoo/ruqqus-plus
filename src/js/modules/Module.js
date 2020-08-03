/**
 * Parent module class
 */
export default class Module {
  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    throw new Error('getLabel not implemented.');
  }

  /**
   * Called with an object of all settings prior to saving them
   *
   * @param {*} settings
   */
  saveSettings = (settings) => {}

  /**
   * Called from the content script
   */
  execContentContext = () => {
  };

  /**
   * Called from the script injected into the page
   */
  execWindowContext = () => {
  };

  /**
   * Dispatches an event
   *
   * @param {string} event
   * @param {*} detail
   */
  dispatch = (event, detail = {}) => {
    document.dispatchEvent(new CustomEvent(event, {
      detail
    }));
  };

  /**
   * Listens for an event
   *
   * @param {string} event
   * @param {Function} callback
   */
  listen = (event, callback) => {
    document.addEventListener(event, callback);
  };
}

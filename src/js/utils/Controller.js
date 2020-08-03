/**
 * Base class for actions and modules
 */
export default class Controller {
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
   * Called from the background script
   */
  execBackgroundContext = () => {
  }

  /**
   * Called when the extension is installed
   */
  onInstalled = () => {}

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

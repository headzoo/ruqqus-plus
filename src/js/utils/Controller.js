/**
 * Base class for actions and modules
 */
export default class Controller {
  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
  };

  /**
   * Called from the script injected into the page
   *
   * Code run from here has access to the ruqqus `window` object but not the
   * chrome extension API.
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

import toastr from 'toastr';

/**
 * Base class for actions and modules
 */
export default class Controller {
  /**
   * All modules have on/off checkboxes on the extension settings page, but
   * modules may also have advanced settings which are reachable from the
   * settings page sidebar. This method returns the label used in the sidebar.
   *
   * @returns {string} Return a falsy value when the module does not have advanced settings
   */
  getSettingsSidebarLabel = () => {
    return '';
  };

  /**
   * Returns the advanced settings form when applicable. The method must return
   * a React component.
   *
   * @returns {*}
   */
  getSettingsComponent = () => {
    return null;
  };

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
  };

  /**
   * Called from the script injected into the page
   *
   * Code from here has access to the ruqqus `window` object but not the
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
  onInstalled = () => {
  }

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

  /**
   * @param {string} message
   */
  toastError = (message) => {
    toastr.error(message, '', {
      closeButton:   true,
      positionClass: 'toast-bottom-center'
    });
  };

  /**
   * @param {string} message
   */
  toastSuccess = (message) => {
    toastr.success(message, '', {
      closeButton:   true,
      positionClass: 'toast-bottom-center'
    });
  };
}

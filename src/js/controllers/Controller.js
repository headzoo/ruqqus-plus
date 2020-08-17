import * as toast from '../utils/toast';
import events from '../utils/events';

/**
 * Base class for actions and modules
 */
export default class Controller {
  ready = false;

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
   * Called when the user exports the extension data
   *
   * Should return all values that have been saved by the controller or module. Should
   * return a falsy value when the controller/module has nothing to export.
   *
   * @returns {Promise}
   */
  exportData = () => {
    return Promise.resolve(false);
  }

  /**
   * Called when the user imports extension data
   *
   * Will receive the values saved for the controller or module.
   *
   * @param {*} data
   * @returns {Promise}
   */
  importData = (data) => {
    return Promise.resolve(true);
  };

  /**
   * Wrapper around the DOMContentLoaded event
   *
   * @param {Function} callback
   */
  onDOMReady = (callback) => {
    document.addEventListener('DOMContentLoaded', () => {
      if (!this.ready) {
        this.ready = true;
        callback();
      }
    }, false);
  };

  /**
   * Dispatches an event
   *
   * @param {string} event
   * @param {*} detail
   */
  dispatch = (event, detail = {}) => {
    return events.dispatch(event, {
      ...detail,
      sender: this.constructor.name
    });
  };

  /**
   * Listens for an event
   *
   * @param {string} event
   * @param {Function} callback
   */
  listen = (event, callback) => {
    return events.listen(event, callback);
  };

  /**
   * @param {string} message
   */
  toastError = (message) => {
    toast.toastError(message);
  };

  /**
   * @param {string} message
   */
  toastSuccess = (message) => {
    toast.toastSuccess(message);
  };
}

/**
 * Facilitates passing messages between contexts
 */
class Events {
  /**
   * @type {{}}
   */
  listeners = {};

  /**
   * Constructor
   */
  constructor() {
    window.addEventListener('message', (event) => {
      if (event.source === window && event.data && event.data.event) {
        if (this.listeners[event.data.event]) {
          this.listeners[event.data.event].forEach((callback) => {
            callback(event.data);
          });
        }
      }
    });
  }

  /**
   * Dispatches an event
   *
   * @param {string} event
   * @param {*} detail
   */
  dispatch = (event, detail = {}) => {
    window.postMessage({ event, detail }, '*');
  };

  /**
   * Listens for an event
   *
   * @param {string} event
   * @param {Function} callback
   */
  listen = (event, callback) => {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  };
}

export default new Events();

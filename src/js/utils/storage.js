/**
 * Wrapper around chrome.storage.sync
 */
class Storage {
  /**
   * @param {string} key        Save using this key
   * @param {{}}     values     Must be an object
   * @param {number} expiration Milliseconds until the value expires
   * @returns {Promise}
   */
  set = (key, values, expiration = 0) => {
    return new Promise((resolve, reject) => {
      if (typeof values !== 'object' || Array.isArray(values)) {
        reject(new Error('Storage value must be an object.'));
      }

      const stored = {
        ...values,
        _time:       (new Date()).getTime(),
        _expiration: expiration
      };
      chrome.storage.sync.set({ [key]: stored }, resolve);
    });
  };

  /**
   * @param {string} key          Retrieve value saved using this key
   * @param {*}      defaultValue Value to resolve when the key is not set
   * @returns {Promise}
   */
  get = (key, defaultValue = undefined) => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (resp) => {
        if (resp[key] === undefined) {
          resolve(defaultValue);
        }

        const values = resp[key];
        const { _expiration, _time, ...rest } = values;
        if (_expiration !== undefined && _time !== undefined && _expiration !== 0) {
          const diff = (new Date()).getTime() - _time;
          if (diff >= _expiration) {
            chrome.storage.sync.remove(key, () => {
              resolve(defaultValue);
            });
            return;
          }
        }

        resolve(rest);
      });
    });
  };

  /**
   * @param {string} key Key for storage value to remove
   * @returns {Promise}
   */
  remove = (key) => {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(key, resolve);
    });
  };

  /**
   * @param {Function} callback Called when there is a storage change
   */
  onChanged = (callback) => {
    chrome.storage.onChanged.addListener((changes) => {
      const newChanges = {};
      Object.keys(changes).forEach((key) => {
        const { newValue, oldValue } = changes[key];
        if (newValue._time !== undefined) {
          delete newValue._time;
        }
        if (oldValue._time !== undefined) {
          delete oldValue._time;
        }
        if (newValue._expiration !== undefined) {
          delete newValue._expiration;
        }
        if (oldValue._expiration !== undefined) {
          delete oldValue._expiration;
        }
        newChanges[key] = { newValue, oldValue };
      });
      callback(newChanges);
    });
  };
}

export default new Storage();

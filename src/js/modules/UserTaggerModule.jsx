import { createElement, insertAfter, querySelectorEach } from '../utils/web';
import Module from './Module';

/**
 * Handles tagging users
 */
export default class UserTaggerModule extends Module {
  /**
   * @type {IDBDatabase}
   */
  db = null;

  /**
   * @type {{}}
   */
  tags = {};

  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {boolean}
   */
  static isEnabledByDefault = () => {
    return true;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'User Tagger';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Adds a button next to each username which lets you tag the user with lists of words.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.onDOMReady(() => {
      const dbReq = indexedDB.open('TaggerAction', 1);
      dbReq.onupgradeneeded = (e) => {
        this.db = e.target.result;
        this.db.createObjectStore('userTags', { keyPath: 'username' });
      };
      dbReq.onsuccess = (e) => {
        this.db = e.target.result;
        this.wireupUserNames();
        this.listen('rp.change', this.wireupUserNames);
      };
      dbReq.onerror = (e) => {
        this.toastError(`Error initializing tagger. ${e.target.errorCode}`);
      };
    });
  };

  /**
   *
   */
  wireupUserNames = async () => {
    querySelectorEach('.user-name', this.wireupUser);
  };

  /**
   * @param {HTMLElement} el
   * @returns {Promise<void>}
   */
  wireupUser = async (el) => {
    if (el.getAttribute('data-rp-tagged')) {
      return;
    }
    el.setAttribute('data-rp-tagged', 'true');

    const username = el.getAttribute('href').replace('/@', '');
    const tagIcon  = createElement('span', {
      'title':        'Tag User',
      'class':        'rp-pointer',
      'data-rp-user': username,
      'html':         '&nbsp;&nbsp;<i class="fas fa-tag" />',
      'on':           {
        'click': this.handleTagClick
      }
    });
    insertAfter(el, tagIcon);

    const tags    = await this.getUserTags(username);
    const tagWrap = document.createElement('span');
    tagWrap.classList.add('rp-user-tag-wrap');
    if (tags === -1) {
      tagWrap.classList.add('rp-user-tag-wrap-empty');
    }

    const tagSpan = createElement('span', {
      'class':             'rp-user-tag',
      'data-rp-user-tags': username,
      'text':              tags !== -1 ? tags.join(', ') : ''
    });
    tagWrap.appendChild(tagSpan);
    insertAfter(tagIcon, tagWrap);
  }

  /**
   * @param {string} username
   * @returns {Promise<string[]|number>}
   */
  getUserTags = (username) => {
    return new Promise((resolve) => {
      if (this.tags[username]) {
        resolve(this.tags[username]);
        return;
      }

      const tx    = this.db.transaction(['userTags'], 'readonly');
      const store = tx.objectStore('userTags');
      const req   = store.get(username);
      req.onsuccess = (e) => {
        if (e.target.result && e.target.result.tags) {
          this.tags[username] = e.target.result.tags;
        } else {
          this.tags[username] = -1;
        }
        resolve(this.tags[username]);
      };
    });
  };

  /**
   * @param {MouseEvent} e
   */
  handleTagClick = async (e) => {
    const { currentTarget } = e;

    const username = currentTarget.getAttribute('data-rp-user');
    const userTags = await this.getUserTags(username);
    let promptValue = '';
    if (userTags !== -1) {
      promptValue = userTags.join(', ');
    }

    // eslint-disable-next-line no-alert
    const result = window.prompt('Comma separated list of tags:', promptValue);
    if (result) {
      const input = result.tags;

      const tx    = this.db.transaction(['userTags'], 'readwrite');
      const store = tx.objectStore('userTags');

      if (input) {
        const tags = input.split(',').map((t) => t.trim());
        const row  = { username, tags };
        if (userTags !== -1) {
          store.put(row);
        } else {
          store.add(row);
        }

        tx.oncomplete = () => {
          this.tags[username] = tags;
          querySelectorEach(`[data-rp-user-tags="${username}"]`, (el) => {
            el.innerText = tags.join(', ');
            el.parentElement.classList.remove('rp-user-tag-wrap-empty');
          });
        };
        tx.onerror = (ev) => {
          this.toastError(`Error saving tag. ${ev.target.errorCode}`);
        };
      } else {
        store.delete(username);
        this.tags[username] = -1;
        querySelectorEach(`[data-rp-user-tags="${username}"]`, (el) => {
          el.innerText = '';
          el.parentElement.classList.add('rp-user-tag-wrap-empty');
        });
      }
    }
  };
}

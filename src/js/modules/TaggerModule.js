import { setAttributes, insertAfter } from '../utils/web';
import Module from './Module';

/**
 * Handles tagging users
 */
export default class TaggerModule extends Module {
  /**
   * @type {IDBDatabase}
   */
  db = null;

  /**
   * @type {{}}
   */
  tags = {};

  /**
   * Returns 1 or 0
   *
   * @returns {number}
   */
  static getDefaultSetting = () => {
    return 1;
  };

  /**
   * @returns {string}
   */
  getLabel = () => {
    return 'User tagging';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    const dbReq = indexedDB.open('TaggerAction', 1);
    dbReq.onupgradeneeded = (e) => {
      this.db = e.target.result;
      this.db.createObjectStore('userTags', { keyPath: 'username' });
    };
    dbReq.onsuccess = (e) => {
      this.db = e.target.result;
      this.wireupUserNames();
    };
    dbReq.onerror = (e) => {
      this.toastError(`Error initializing tagger action. ${e.target.errorCode}`);
    };
  };

  /**
   *
   */
  wireupUserNames = async () => {
    document.querySelectorAll('.user-name').forEach(this.wireupUser);
  };

  /**
   * @param {HTMLElement} el
   * @returns {Promise<void>}
   */
  wireupUser = async (el) => {
    const username = el.getAttribute('href').replace('/@', '');
    const tagIcon  = document.createElement('span');
    setAttributes(tagIcon, {
      'title':        'Tag User',
      'class':        'pointer',
      'data-rp-user': username,
      'html':         '&nbsp;&nbsp;<i class="fas fa-tag"></i>&nbsp;'
    });
    insertAfter(el, tagIcon);
    tagIcon.addEventListener('click', this.handleTagClick);

    const tags = await this.getUserTags(username);
    if (tags !== -1) {
      const tagWrap = document.createElement('span');
      tagWrap.setAttribute('class', 'rp-user-tag-wrap');

      const tagSpan = document.createElement('span');
      setAttributes(tagSpan, {
        'class':             'rp-user-tag',
        'data-rp-user-tags': username,
        'text':              tags.join(', ')
      });
      tagWrap.appendChild(tagSpan);
      insertAfter(tagIcon, tagWrap);
    }
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

    const input = prompt('Comma separated list of tags', promptValue); // eslint-disable-line
    if (input) {
      const tags  = input.split(',').map((t) => t.trim());
      const tx    = this.db.transaction(['userTags'], 'readwrite');
      const store = tx.objectStore('userTags');

      const row = { username, tags };
      if (userTags !== -1) {
        store.put(row);
      } else {
        store.add(row);
      }
      tx.oncomplete = () => {
        this.tags[username] = tags;
        document.querySelectorAll(`[data-rp-user-tags="${username}"]`).forEach((el) => {
          el.innerText = tags.join(', ');
        });
      };
      tx.onerror = (ev) => {
        this.toastError(`Error saving tag. ${ev.target.errorCode}`);
      };
    }
  };
}

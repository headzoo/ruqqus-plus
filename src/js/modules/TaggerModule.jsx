import React from 'react';
import purePopup from '../utils/purePopup';
import { createElement, insertAfter } from '../utils/web';
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
   * @returns {string}
   */
  getSettingsSidebarLabel = () => {
    return 'Tagged Users';
  };

  /**
   * @returns {*}
   */
  getSettingsComponent = () => {
    return () => {
      return (
        <div>
          Not implemented yet.
        </div>
      );
    };
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
      this.listen('rp.change', this.wireupUserNames);
    };
    dbReq.onerror = (e) => {
      this.toastError(`Error initializing tagger. ${e.target.errorCode}`);
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

    purePopup.prompt({
      title:  `Tagging ${username}.`,
      inputs: {
        tags: 'Comma separated list of tags:'
      },
      values: {
        tags: promptValue
      }
    }, (result) => {
      if (result.confirm === 'ok') {
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
            document.querySelectorAll(`[data-rp-user-tags="${username}"]`).forEach((el) => {
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
          document.querySelectorAll(`[data-rp-user-tags="${username}"]`).forEach((el) => {
            el.innerText = '';
            el.parentElement.classList.add('rp-user-tag-wrap-empty');
          });
        }
      }
    });
  };
}

import moment from 'moment';
import Module from './Module';
import { fetchPost, fetchMe } from '../utils/ruqqus';
import { setHTML, createElement, createTemplateContent } from '../utils/web';
import { parseTemplate } from '../utils/templates';
import postTemplate from './templates/post';

/**
 * Handles tagging users
 */
export default class PostSaveModule extends Module {
  /**
   * @type {IDBDatabase}
   */
  db = null;

  /**
   * @type {string}
   */
  username = '';

  /**
   * @type {boolean}
   */
  isProfile = false;

  /**
   * Returns 1 or 0
   *
   * @returns {number}
   */
  static getDefaultSetting = () => {
    return 1;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'Save posts';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Adds a button to save posts. Saved posts are viewable from your profile.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    if (document.location.pathname.indexOf('/@') !== -1) {
      this.handleProfile();
    }

    this.getDatabase()
      .then((db) => {
        this.db = db;
        this.wireupCards();
        this.listen('rp.change', this.wireupCards);
      });
  };

  /**
   *
   */
  wireupCards = () => {
    const postActions = document.querySelectorAll('.post-actions ul');
    postActions.forEach((el) => {
      const card = el.closest('.card');
      if (card && card.querySelector('a[data-rp-saved]')) {
        return;
      }

      const id = card.getAttribute('id').replace('post-', '');
      this.isSaved(id)
        .then((isSaved) => {
          const item = createElement('li', {
            'class': 'list-inline-item'
          });
          const anchor = createElement('a', {
            'href':          'javascript:void(0)', // eslint-disable-line
            'title':         isSaved ? 'UnSave this post' : 'Save this post',
            'html':          isSaved ? '<i class="fas fa-save"></i> UnSave' : '<i class="fas fa-save"></i> Save',
            'data-rp-saved': id,
            'on':            {
              click: this.handleSaveClick
            }
          });
          item.appendChild(anchor);
          el.appendChild(item);
        });
    });
  };

  /**
   * @param {Event} e
   */
  handleSaveClick = (e) => {
    const { currentTarget } = e;

    const card = currentTarget.closest('.card');
    const id   = card.getAttribute('id').replace('post-', '');
    this.isSaved(id)
      .then((isSaved) => {
        if (isSaved) {
          const tx    = this.db.transaction(['posts'], 'readwrite');
          const store = tx.objectStore('posts');
          const req   = store.delete(id);
          req.onsuccess = () => {
            this.toastSuccess('Post unsaved!');
            if (this.isProfile) {
              card.remove();
            } else {
              const link = document.querySelector(`a[data-rp-saved="${id}"]`);
              if (link) {
                setHTML(link, '<i class="fas fa-save"></i> Save');
              }
            }
          };
          req.onerror = (ev) => {
            this.toastError(`Error unsaving post. ${ev.target.errorCode}`);
          };
        } else {
          fetchPost(id)
            .then((details) => {
              if (details) {
                const tx    = this.db.transaction(['posts'], 'readwrite');
                const store = tx.objectStore('posts');
                const req   = store.add(details);
                req.onsuccess = () => {
                  this.toastSuccess('Post saved!');
                  const link = document.querySelector(`a[data-rp-saved="${id}"]`);
                  if (link) {
                    setHTML(link, '<i class="fas fa-save"></i> UnSave');
                  }
                };
                req.onerror = (ev) => {
                  this.toastError(`Error saving post. ${ev.target.errorCode}`);
                };
              }
            });
        }
      });
  };

  /**
   *
   */
  handleProfile = () => {
    let item;
    const nav = document.querySelector('.settings-nav');
    if (nav && !nav.querySelector('.rp-nav-link')) {
      item = createElement('li', {
        'class': 'nav-item',
        'html':  `<img src="${chrome.runtime.getURL('images/loading.svg')}" alt="Loading" style="margin-top: 5px" />`
      });
      nav.appendChild(item);
    }

    fetchMe()
      .then(({ username }) => {
        if (username && document.location.pathname === `/@${username}`) {
          if (item) {
            const anchor = createElement('a', {
              'class': 'nav-link rp-nav-link',
              'href':  '#',
              'text':  'Saved Posts',
              'on':    {
                'click': this.handleNavClick
              }
            });

            setHTML(item, '');
            item.appendChild(anchor);
          }
        } else if (item) {
          item.remove();
        }
      });
  };

  /**
   * @param {Event} e
   */
  handleNavClick = (e) => {
    e.preventDefault();
    this.isProfile = true;

    const pagination = document.querySelector('.pagination');
    if (pagination) {
      pagination.remove();
    }
    document.querySelector('.rp-nav-link').classList.add('active');
    const active = document.querySelector('.nav-link.active');
    if (active) {
      active.classList.remove('active');
    }

    const tx    = this.db.transaction(['posts'], 'readonly');
    const store = tx.objectStore('posts');
    const req   = store.getAll();

    req.onsuccess = (ev) => {
      const { result } = ev.target;

      const posts = document.querySelector('.posts');
      setHTML(posts, '');
      result.forEach((record) => {
        const u     = new URL(record.url);
        record.host = u.hostname;
        record.date = moment(parseInt(record.created_utc, 10) * 1000).format('D MMM YYYY');
        const post  = createTemplateContent(parseTemplate(postTemplate, record));
        posts.appendChild(post);
      });
      this.dispatch('rp.change');
    };
    req.onerror = (ev) => {
      this.toastError(`Error retrieving saved posts. ${ev.target.errorCode}`);
    };
  };

  /**
   * @returns {Promise<IDBDatabase>}
   */
  getDatabase = () => {
    return new Promise((resolve) => {
      const dbReq = indexedDB.open('PostSaveModule', 1);
      dbReq.onupgradeneeded = (e) => {
        e.target.result.createObjectStore('posts', { keyPath: 'id' });
      };
      dbReq.onsuccess = (e) => {
        resolve(e.target.result);
      };
      dbReq.onerror = (e) => {
        this.toastError(`Error initializing post save. ${e.target.errorCode}`);
      };
    });
  };

  /**
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  isSaved = (id) => {
    return new Promise((resolve) => {
      const tx    = this.db.transaction(['posts'], 'readonly');
      const store = tx.objectStore('posts');
      const req   = store.get(id);
      req.onsuccess = (e) => {
        if (e.target.result) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
    });
  };
}

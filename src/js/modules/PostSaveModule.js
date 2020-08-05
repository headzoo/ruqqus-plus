import moment from 'moment';
import Module from './Module';
import { fetchPost, fetchMe } from '../utils/ruqqus';
import { setAttributes, createTemplateContent } from '../utils/web';
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
   * @returns {string}
   */
  getLabel = () => {
    return 'Save posts';
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
          const item = document.createElement('li');
          item.classList.add('list-inline-item');

          const anchor = document.createElement('a');
          setAttributes(anchor, {
            'href':          'javascript:void(0)', // eslint-disable-line
            'html':          isSaved ? '<i class="fas fa-save"></i> UnSave' : '<i class="fas fa-save"></i> Save',
            'data-rp-saved': id
          });
          anchor.addEventListener('click', this.handleSaveClick, false);
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
                link.innerHTML = '<i class="fas fa-save"></i> Save';
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
                    link.innerHTML = '<i class="fas fa-save"></i> UnSave';
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
    let item  = null;
    const nav = document.querySelector('.settings-nav');
    if (nav && !nav.querySelector('.rp-nav-link')) {
      item = document.createElement('li');
      item.classList.add('nav-item');
      item.innerHTML = `
        <img src="${chrome.runtime.getURL('images/loading.svg')}" alt="Loading" style="margin-top: 5px" />
      `;
      nav.appendChild(item);
    }

    fetchMe()
      .then(({ username }) => {
        if (username && document.location.pathname === `/@${username}`) {
          if (item) {
            const anchor = document.createElement('a');
            setAttributes(anchor, {
              'class': 'nav-link rp-nav-link',
              'href':  '#',
              'text':  'Saved Posts'
            });
            anchor.addEventListener('click', this.handleNavClick, false);

            item.innerHTML = '';
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

    document.querySelector('.pagination').remove();
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
      posts.innerHTML = '';
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

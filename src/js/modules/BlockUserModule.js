import Module from './Module';
import storage from '../utils/storage';
import purePopup from '../utils/purePopup';
import { createElement } from '../utils/web';
import { fetchMe } from '../utils/ruqqus';

/**
 * Removes content from users which are blocked
 */
export default class BlockUserModule extends Module {
  /**
   * @type {string[]}
   */
  blockedUsers = [];

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
    return 'Removes content from users which are blocked';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Adds a button to block users. Blocked user posts and comments will not be visible.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.listen('rp.change', this.execContentContext);

    storage.get('blockedUsers', { usernames: [] })
      .then((blockedUsers) => {
        this.blockedUsers = blockedUsers.usernames;

        if (document.location.pathname.indexOf('/@') !== -1) {
          this.handleProfile();
          return;
        }

        const posts = document.querySelector('.posts');
        if (posts) {
          posts.querySelectorAll('.card').forEach((card) => {
            const username = card.querySelector('.user-name').innerText.trim();
            if (this.blockedUsers.indexOf(username) !== -1) {
              card.remove();
            } else {
              this.wireupCard(card);
            }
          });
        }

        const comments = document.querySelector('.comment-section');
        if (comments) {
          comments.querySelectorAll('.comment').forEach((card) => {
            const username = card.querySelector('.user-name').innerText.trim();
            if (this.blockedUsers.indexOf(username) !== -1) {
              card.remove();
            } else {
              this.wireupComment(card);
            }
          });
        }
      });
  }

  /**
   * @param {Element} card
   */
  wireupCard = (card) => {
    if (card && card.querySelector('a[data-rp-blocked-id]')) {
      return;
    }

    const item    = this.createBlockLink(card, 'post');
    const actions = card.querySelector('.post-actions ul');
    actions.appendChild(item);
  };

  /**
   * @param {Element} comment
   */
  wireupComment = (comment) => {
    if (comment && comment.querySelector('a[data-rp-blocked-id]')) {
      return;
    }

    const item   = this.createBlockLink(comment, 'comment');
    const parent = comment.querySelector('.comment-actions ul .dropdown').parentElement;
    parent.parentElement.insertBefore(item, parent);
  };

  /**
   * @param {Element} card
   * @param {string} type
   * @returns {Element}
   */
  createBlockLink = (card, type) => {
    const id   = card.getAttribute('id').replace(`${type}-`, '');
    const item = createElement('li', {
      'class': 'list-inline-item'
    });
    const anchor = createElement('a', {
      'href':                 'javascript:void(0)', // eslint-disable-line
      'title':                "Block user's content",
      'html':                 '<i class="fas fa-ban"></i> Block User',
      'data-rp-blocked-id':   id,
      'data-rp-blocked-type': type,
      'on':                   {
        click: this.handleBlockClick
      }
    });
    item.appendChild(anchor);

    return item;
  };

  /**
   * @param {Event} e
   */
  handleBlockClick = (e) => {
    e.preventDefault();

    const { currentTarget } = e;
    const id   = currentTarget.getAttribute('data-rp-blocked-id');
    const type = currentTarget.getAttribute('data-rp-blocked-type');
    const card = document.getElementById(`${type}-${id}`);
    if (!card) {
      return;
    }

    const username = card.querySelector('.user-name').innerText.trim();
    purePopup.confirm({ title: `Are you sure you want to block ${username}?` }, ({ confirm }) => {
      if (confirm === 'ok') {
        if (this.blockedUsers.indexOf(username) === -1) {
          this.blockedUsers.push(username);
          storage.set('blockedUsers', { usernames: this.blockedUsers })
            .then(() => {
              this.removeUserCards(username);
              this.toastSuccess(`User ${username} blocked.`);
            });
        }
      }
    });
  };

  /**
   * @param {string} username
   */
  removeUserCards = (username) => {
    document.querySelectorAll('.posts .card').forEach((card) => {
      if (card.querySelector('.user-name').innerText.trim() === username) {
        card.remove();
      }
    });
    document.querySelectorAll('.comment').forEach((comment) => {
      if (comment.querySelector('.user-name').innerText.trim() === username) {
        comment.remove();
      }
    });
  }

  /**
   *
   */
  handleProfile = () => {
    let item  = null;
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
              'class': 'nav-link rp-nav-blocked-link',
              'href':  '#',
              'text':  'Blocked Users',
              'on':    {
                'click': this.handleNavClick
              }
            });

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

    document.querySelector('.rp-nav-blocked-link').classList.add('active');
    const active = document.querySelector('.nav-link.active');
    if (active) {
      active.classList.remove('active');
    }

    const pagination = document.querySelector('.pagination');
    if (pagination) {
      pagination.remove();
    }

    const posts = document.querySelector('.posts');
    posts.innerHTML = '';
    this.blockedUsers.forEach((username) => {
      const card = createElement('div', {
        'class':                'card',
        'data-rp-blocked-user': username
      });
      const div = createElement('div', {
        'html': `<span>${username}</span>&nbsp;`
      });
      card.appendChild(div);
      const anchor = createElement('a', {
        'href': 'javascript:void(0)', // eslint-disable-line
        'html': 'Unblock',
        'on':   {
          'click': this.handleUnblockClick
        }
      });
      div.appendChild(anchor);
      posts.appendChild(card);
    });
  };

  /**
   * @param {Event} e
   */
  handleUnblockClick = (e) => {
    e.preventDefault();

    const { currentTarget } = e;
    const card     = currentTarget.closest('.card');
    const username = card.getAttribute('data-rp-blocked-user');

    purePopup.confirm({ title: `Are you sure you want to unblock ${username}?` }, ({ confirm }) => {
      if (confirm === 'ok') {
        const index = this.blockedUsers.indexOf(username);
        if (index !== -1) {
          this.blockedUsers.splice(index, 1);
          storage.set('blockedUsers', { usernames: this.blockedUsers })
            .then(() => {
              card.remove();
              this.toastSuccess(`User ${username} unblocked.`);
            });
        }
      }
    });
  };
}

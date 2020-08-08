import Module from './Module';
import { createElement, querySelectorEach } from '../utils/web';

/**
 * Adds a block user button to posts and comments
 */
export default class BlockUserModule extends Module {
  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {boolean}
   */
  static getDefaultSetting = () => {
    return true;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'Adds a block user button';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Makes it easier to block users by adding a button user button to posts and comments.';
  };

  /**
   * Called from the script injected into the page
   *
   * Code from here has access to the ruqqus `window` object but not the
   * chrome extension API.
   */
  execWindowContext = () => {
    this.listen('rq.blockUser', (data) => {
      const { username } = data.detail;

      const formkey = window.formkey();
      if (!formkey) {
        this.toastError('Error, unable to block user.');
        return;
      }

      const formData = new FormData();
      formData.append('username', username);
      formData.append('formkey', formkey);

      fetch('https://ruqqus.com/settings/block', {
        body:   formData,
        method: 'post'
      })
        .then((resp) => resp.text())
        .then((text) => {
          console.log(text);
        });
    });
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.listen('rp.change', this.execContentContext);

    const posts = document.querySelector('.posts');
    if (posts) {
      querySelectorEach(posts, '.card', this.wireupCard);
    }
    const comments = document.querySelector('.comment-section');
    if (comments) {
      querySelectorEach(comments, '.comment', this.wireupComment);
    }
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

    const item     = this.createBlockLink(comment, 'comment');
    const dropdown = comment.querySelector('.comment-actions ul .dropdown');
    if (dropdown) {
      const parent = dropdown.parentElement;
      parent.parentElement.insertBefore(item, parent);
    }
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
    // eslint-disable-next-line no-alert
    if (window.confirm(`Are you sure you want to block ${username}?`)) {
      // Block needs to happen from the window context in order to access
      // the window.formkey() function. The window context is listening for
      // this event.
      this.dispatch('rq.blockUser', { username });
      this.removeUserCards(username);
      this.toastSuccess(`User ${username} blocked.`);
    }
  };

  /**
   * @param {string} username
   */
  removeUserCards = (username) => {
    querySelectorEach('.posts .card', (card) => {
      if (card.querySelector('.user-name').innerText.trim() === username) {
        card.remove();
      }
    });
    querySelectorEach('.comment', (comment) => {
      if (comment.querySelector('.user-name').innerText.trim() === username) {
        comment.remove();
      }
    });
  }
}

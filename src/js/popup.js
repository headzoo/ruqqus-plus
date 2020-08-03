import * as constants from './utils/constants';

window.addEventListener('DOMContentLoaded', () => {
  const containerAuthed   = document.getElementById('container-authed');
  const containerUnauthed = document.getElementById('container-unauthed');
  const username          = document.getElementById('container-authed-username');
  const avatar            = document.getElementById('container-authed-avatar');
  const rep               = document.getElementById('container-authed-rep');
  const notices           = document.getElementById('container-authed-notices');
  const bell              = notices.querySelector('.fa-bell');
  const badgeCount        = notices.querySelector('.badge-count');

  /**
   * @param {HTMLElement|Node} el
   * @param {string} t
   */
  const show = (el, t = 'block !important') => {
    el.style.display = t;
  };

  /**
   * @param {HTMLElement|Node} el
   */
  const hide = (el) => {
    el.style.display = 'none !important';
  };

  /**
   * @param {{ authed: boolean, user: *, unread: number }} msg
   */
  const updatePage = (msg) => {
    if (!msg.authed) {
      hide(containerAuthed);
      show(containerUnauthed);
      hide(badgeCount);
    } else {
      hide(containerUnauthed);
      show(containerAuthed, 'flex');

      username.innerText = msg.user.username;
      rep.innerText      = `${(parseInt(msg.user.post_rep, 10) + parseInt(msg.user.comment_rep, 10)).toString()  } Rep`;
      avatar.src         = msg.user.profile_url;
      if (msg.unread > 0) {
        bell.classList.add('text-danger');
        badgeCount.innerText = msg.unread;
        show(badgeCount);
      } else {
        bell.classList.remove('text-danger');
        hide(badgeCount);
      }
    }
  };

  chrome.storage.sync.get(['authed', 'user', 'unread'], (values) => {
    const { authed, user, unread } = values;

    updatePage({ authed, user, unread });
  });

  const port = chrome.extension.connect({
    name: 'user'
  });
  port.onMessage.addListener((msg) => {
    switch (msg.type) {
      case constants.TYPE_AUTH:
        chrome.storage.sync.set({
          authed: msg.authed,
          user:   msg.user,
          unread: msg.unread
        });
        updatePage(msg);
        break;
    }
  });

  // Remove the unread count when the notice button is clicked because
  // we're only checking for new unread messages once per minute but we
  // don't want the red bell showing after the user read the notices.
  notices.addEventListener('click', () => {
    bell.classList.remove('text-danger');
    hide(badgeCount);
    port.postMessage({
      type:   constants.TYPE_UNREAD,
      unread: 0
    });
  });
});

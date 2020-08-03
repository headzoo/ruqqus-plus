import * as constants from './constants';

window.addEventListener('DOMContentLoaded', () => {
  const containerAuthed   = document.getElementById('container-authed');
  const containerUnauthed = document.getElementById('container-unauthed');
  const username          = document.getElementById('container-authed-username');
  const avatar            = document.getElementById('container-authed-avatar');
  const rep               = document.getElementById('container-authed-rep');
  const notices           = document.getElementById('container-authed-notices');
  const bell              = notices.querySelector('.fa-bell');
  const badgeCount        = notices.querySelector('.badge-count');

  const port = chrome.extension.connect({
    name: 'state'
  });
  port.onMessage.addListener((msg) => {
    switch (msg.type) {
      case constants.TYPE_AUTH:
        if (!msg.authed) {
          containerUnauthed.style.display = 'block';
          containerAuthed.style.display   = 'none';
        } else {
          containerUnauthed.style.display = 'none';
          containerAuthed.style.display   = 'block';
          username.innerText              = msg.user.username;
          rep.innerText                   = `${(parseInt(msg.user.post_rep, 10) + parseInt(msg.user.comment_rep, 10)).toString()  } Rep`;
          avatar.src                      = msg.user.profile_url;
          if (msg.unread > 0) {
            bell.classList.add('text-danger');
            badgeCount.style.display = 'block';
            badgeCount.innerText     = msg.unread;
          } else {
            bell.classList.remove('text-danger');
            badgeCount.style.display = 'none';
          }
        }
        break;
    }
  });

  notices.addEventListener('click', () => {
    bell.classList.remove('text-danger');
    badgeCount.style.display = 'none';
    port.postMessage({
      type:   constants.TYPE_UNREAD,
      unread: 0
    });
  });
});

import { createTemplateContent } from './web';

export const fetchMe = () => {
  return fetch('https://ruqqus.com/me')
    .then((resp) => resp.text())
    .then((text) => {
      const content = createTemplateContent(text);
      const link    = content.querySelector('a[href^="/@"]');
      const authed  = !!link;
      let username  = '';
      let unread    = 0;

      if (authed) {
        username = link.getAttribute('href').replace('/@', '');

        const notifications = content.querySelector('a[href="/notifications"]');
        if (notifications) {
          const badge = notifications.querySelector('.badge-count');
          if (badge) {
            unread = parseInt(badge.innerText, 10);
          }
        }
      }

      return { authed, username, unread };
    });
};

export const fetchUser = (username) => {
  return fetch(`https://ruqqus.com/api/v1/user/${username}`)
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Received status code ${resp.status}`);
      }
      return resp.json();
    })
    .then((json) => {
      return json;
    });
};

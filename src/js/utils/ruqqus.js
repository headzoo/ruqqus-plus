import { createTemplateContent } from './web';

/**
 * @returns {Promise<{unread: number, authed: boolean, username: string}>}
 */
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

/**
 * @param {string} username
 * @returns {Promise<any>}
 */
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

/**
 * @param {string} pid
 * @returns {Promise<any>}
 */
export const fetchPost = (pid) => {
  return fetch(`https://ruqqus.com/api/v1/post/${pid}`)
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

/**
 * @returns {Promise<[]>}
 */
export const fetchMyGuilds = () => {
  return fetch('https://ruqqus.com/mine')
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Received status code ${resp.status}`);
      }
      return resp.text();
    })
    .then((text) => {
      const html = createTemplateContent(text);

      const guilds = [];
      html.querySelectorAll('.card-body').forEach((body) => {
        const title  = body.querySelector('.card-title');
        const avatar = body.querySelector('img');
        if (title && avatar) {
          guilds.push({
            name:   title.innerText.trim(),
            avatar: avatar.getAttribute('src')
          });
        }
      });

      return guilds;
    });
};

/**
 * returns {boolean}
 */
export const isDarkMode = () => {
  const link = document.getElementById('css-link');
  if (!link) {
    return false;
  }

  return link.getAttribute('href').indexOf('dark') !== -1;
};

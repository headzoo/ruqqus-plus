import { createTemplateContent, querySelectorEach } from './web';
import storage from './storage';
/**
 * @returns {Promise<{unread: number, authed: boolean, username: string}>}
 */
export const fetchMe = () => {
  return new Promise((resolve) => {
    storage.get('fetchMe')
      .then((details) => {
        if (details) {
          resolve(details);
          return;
        }

        fetch('https://ruqqus.com/me')
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

            const resp = { authed, username, unread };
            storage.set('fetchMe', resp, 300 * 1000)
              .then(() => {
                resolve(resp);
              });
          });
      });
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
      querySelectorEach(html, '.card-body', (body) => {
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
 * @returns {Promise<number>}
 */
export const fetchUnread = () => {
  return fetch('https://ruqqus.com/me')
    .then((resp) => resp.text())
    .then((text) => {
      const content = createTemplateContent(text);
      const link    = content.querySelector('a[href^="/@"]');
      let unread    = 0;

      if (link) {
        const notifications = content.querySelector('a[href="/notifications"]');
        if (notifications) {
          const badge = notifications.querySelector('.badge-count');
          if (badge) {
            unread = parseInt(badge.innerText, 10);
          }
        }
      }

      return unread;
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

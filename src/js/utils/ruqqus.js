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
export const fetchMyGuilds = async () => {
  const guilds = [];

  for (let i = 1; i < 10; i++) {
    // eslint-disable-next-line no-await-in-loop
    const text = await fetch(`https://ruqqus.com/mine?page=${i}`)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`Received status code ${resp.status}`);
        }
        return resp.text();
      });

    const html = createTemplateContent(text);
    let found  = false;
    querySelectorEach(html, '.card-body', (body) => {
      const title  = body.querySelector('.card-title');
      const avatar = body.querySelector('img');
      if (title && avatar) {
        found = true;
        guilds.push({
          name:     title.innerText.trim().replace('+', ''),
          avatar:   avatar.getAttribute('src'),
          isMaster: false
        });
      }
    });

    if (!found) {
      break;
    }
  }

  // Find the guild master of guilds.
  const text = await fetch('https://ruqqus.com')
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Received status code ${resp.status}`);
      }
      return resp.text();
    });

  const html    = createTemplateContent(text);
  const sidebar = html.querySelector('.sidebar-left');
  if (sidebar) {
    const recommendations = sidebar.querySelectorAll('.guild-recommendations-list.sidebar-collapsed-hidden');
    const last = recommendations[recommendations.length - 1];
    last.querySelectorAll('.guild-recommendations-item a').forEach((el) => {
      const guildName = el.getAttribute('href').replace('/+', '');
      for (let i = 0; i < guilds.length; i++) {
        if (guilds[i].name === guildName) {
          guilds[i].isMaster = true;
          break;
        }
      }
    });
  }

  return guilds;
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
 * @param {string} guild
 * @returns {Promise<any>}
 */
export const fetchGuildListing = (guild) => {
  return fetch(`https://ruqqus.com/api/v1/guild/${guild}/listing`)
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
 * returns {boolean}
 */
export const isDarkMode = () => {
  const link = document.getElementById('css-link');
  if (!link) {
    return false;
  }

  return link.getAttribute('href').indexOf('dark') !== -1;
};

/**
 * @param {string} path
 * @returns {string}
 */
export const extractGuildName = (path) => {
  const matches = path.match(/\/\+([a-z0-9_]+)/i);
  if (!matches || matches.length < 2) {
    return '';
  }

  return matches[1];
};

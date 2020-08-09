import Module from './Module';
import { fetchGuildListing } from '../utils/ruqqus';
import storage from '../utils/storage';

/**
 * Opens posts in a new tab.
 */
export default class WatchGuildsModule extends Module {
  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {boolean}
   */
  static isEnabledByDefault = () => {
    return true;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'Watch Guilds';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Allows receiving notices when watched guilds receive new posts. Watch up to 5 guilds.';
  };

  execContentContext = () => {
    /* this.processGuild('RuqqusPlus')
      .then(this.setUnread);*/
  };

  /**
   * Called from the background script
   */
  execBackgroundContext = () => {
    this.processAlarm();
    chrome.alarms.create('WatchGuildsModule', { periodInMinutes: 1.0 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'WatchGuildsModule') {
        this.processAlarm();
      }
    });
  }

  /**
   *
   */
  processAlarm = () => {
    storage.get('watchedGuilds', [])
      .then((guilds) => {
        if (guilds.length === 0) {
          return;
        }

        const promises = [];
        for (let i = 0; i < guilds.length; i++) {
          promises.push(this.processGuild(guilds[i]));
        }
        console.log(promises);
        Promise.all(promises)
          .then(() => {
            console.log('Alarm processed');
            this.setUnread();
          })
          .catch((errors) => {
            console.error(errors);
          });
      });
  }

  /**
   * @param {string} guild
   */
  processGuild = (guild) => {
    return new Promise((resolve, reject) => {
      console.log(guild);
      this.getDatabase()
        .then((db) => {
          fetchGuildListing(guild)
            .then((posts) => {
              const postCount = posts.length;
              if (postCount === 0) {
                resolve();
                return;
              }

              const promises = [];
              for (let i = 0; i < postCount; i++) {
                const post    = posts[i];
                const tx      = db.transaction(['posts'], 'readwrite');
                const store   = tx.objectStore('posts');
                const req     = store.get(post.id);

                req.onsuccess = (e) => {
                  promises.push(this.handleStoreSuccess(e, store, post));
                };
                req.onerror = (e) => {
                  console.error(e);
                };
              }

              Promise.all(promises)
                .then(resolve);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  };

  /**
   * @param {Event} e
   * @param {IDBObjectStore} store
   * @param {*} post
   */
  handleStoreSuccess = (e, store, post) => {
    return new Promise((resolve) => {
      const { result } = e.target;

      if (!result) {
        const record = {
          id:          post.id,
          author:      post.author,
          created_utc: post.created_utc,
          title:       post.title,
          permalink:   post.permalink,
          isRead:      false
        };
        console.log(record.permalink);
        const req = store.add(record);
        req.onsuccess = resolve;
        req.onerror   = resolve;
      } else {
        resolve();
      }
    });
  };

  /**
   *
   */
  setUnread = () => {
    /* this.getDatabase()
      .then((db) => {
        const tx      = db.transaction(['posts'], 'readwrite');
        const store   = tx.objectStore('posts');
        const req     = store.get({ isRead: false });
      }); */

    /* if (unread > 0) {
      chrome.browserAction.setBadgeText({ text: unread.toString() });
      chrome.browserAction.setBadgeBackgroundColor({ color: '#56e53d' });
    } else {
      chrome.browserAction.setBadgeText({ text: '' });
    } */
  };

  /**
   * @returns {Promise<IDBDatabase>}
   */
  getDatabase = () => {
    return new Promise((resolve, reject) => {
      const dbReq = indexedDB.open('WatchGuildsModule', 2);
      dbReq.onupgradeneeded = (e) => {
        const store = e.target.result.createObjectStore('posts', { keyPath: 'id' });
        store.createIndex('isRead', 'isRead', { unique: false });
      };
      dbReq.onsuccess = (e) => {
        resolve(e.target.result);
      };
      dbReq.onerror = (e) => {
        reject(new Error(`Error initializing watch guilds module. ${e.target.errorCode}`));
      };
    });
  };
}

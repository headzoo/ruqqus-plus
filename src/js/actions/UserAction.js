import Action from './Action';
import { fetchMe, fetchUser } from '../utils/ruqqus';
import * as constants from '../utils/constants';

/**
 * Manages the user account
 */
export default class UserAction extends Action {
  userDetails = {
    authed: false,
    unread: 0,
    user:   null
  };

  /**
   * @returns {string}
   */
  getLabel = () => {
    return '';
  };

  /**
   * Called from the background script
   */
  execBackgroundContext = () => {
    chrome.alarms.create('fetchAuth', { periodInMinutes: 1.0 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'fetchAuth') {
        this.fetchAuth();
      }
    });

    chrome.extension.onConnect.addListener((port) => {
      port.onMessage.addListener((msg) => {
        switch (msg.type) {
          case constants.TYPE_UNREAD:
            this.userDetails.unread = msg.unread;
            this.setUnread(msg.unread);
            break;
        }
      });

      port.postMessage({
        type: constants.TYPE_AUTH,
        ...this.userDetails
      });

      this.fetchAuth()
        .then(() => {
          port.postMessage({
            type: constants.TYPE_AUTH,
            ...this.userDetails
          });
        });
    });

    this.fetchAuth();
  };

  /**
   * @returns {Promise<{unread: number, authed: boolean, username: string}>}
   */
  fetchAuth = () => {
    return fetchMe()
      .then(({ authed, unread, username }) => {
        if (!authed) {
          this.resetUserDetails();
        } else {
          fetchUser(username)
            .then((user) => {
              console.log(unread, user.username);
              this.userDetails.authed = authed;
              this.userDetails.unread = unread;
              this.userDetails.user   = user;
              this.setUnread(unread);
            })
            .catch((err) => {
              console.error(err);
              this.resetUserDetails();
            });
        }
      })
      .catch((err) => {
        console.error(err);
        this.resetUserDetails();
      });
  };

  /**
   * @param {number} unread
   */
  setUnread = (unread) => {
    if (unread > 0) {
      chrome.browserAction.setBadgeText({ text: unread.toString() });
      chrome.browserAction.setBadgeBackgroundColor({ color: '#E53E3D' });
    } else {
      chrome.browserAction.setBadgeText({ text: '' });
    }
  };

  /**
   *
   */
  resetUserDetails = () => {
    this.userDetails.authed = false;
    this.userDetails.unread = 0;
    this.userDetails.user   = null;
    this.setUnread(0);
  };
}

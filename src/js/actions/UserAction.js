import Action from './Action';
import { fetchMe } from '../utils/ruqqus';

/**
 * Manages the user account
 */
export default class UserAction extends Action {
  /**
   * Called from the background script
   */
  execBackgroundContext = () => {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.event && request.event === 'rq.setUnread') {
        this.setUnread(request.data.unread);
      }
    });

    chrome.alarms.create('fetchAuth', { periodInMinutes: 1.0 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'fetchAuth') {
        this.fetchAuth();
      }
    });
    this.fetchAuth();
  };

  /**
   *
   */
  fetchAuth = () => {
    fetchMe()
      .then(({ authed, unread }) => {
        if (!authed) {
          this.setUnread(0);
        } else {
          this.setUnread(unread);
        }
      })
      .catch((err) => {
        console.error(err);
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
}

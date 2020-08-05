import Action from './Action';
import { fetchUnread } from '../utils/ruqqus';

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
        fetchUnread()
          .then((unread) => {
            this.setUnread(unread);
          });
      }
    });

    fetchUnread()
      .then((unread) => {
        this.setUnread(unread);
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

import { fetchUnread } from '../utils/ruqqus';
import Controller from './Controller';
import storage from '../utils/storage';

/**
 * Manages the user account
 */
export default class UserController extends Controller {
  /**
   * Called from the background script
   */
  execBackgroundContext = () => {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.event && request.event === 'rq.setUnread') {
        storage.set('unread', request.data.unread)
          .then(() => {
            this.setBadgeText(request.data.unread);
          });
      }
    });

    chrome.alarms.create('fetchAuth', { periodInMinutes: 1.0 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'fetchAuth') {
        fetchUnread()
          .then((unread) => {
            this.setBadgeText(unread);
            storage.set('unread', unread);
          });
      }
    });

    fetchUnread()
      .then((unread) => {
        this.setBadgeText(unread);
        storage.set('unread', unread);
      });
  };

  /**
   * @param {number} unread
   */
  setBadgeText = (unread) => {
    if (unread > 0) {
      chrome.browserAction.setBadgeText({ text: unread.toString() });
      chrome.browserAction.setBadgeBackgroundColor({ color: '#E53E3D' });
    } else {
      chrome.browserAction.setBadgeText({ text: '' });
    }
  };
}

import * as constants from './constants';
import { fetchMe, fetchUser } from './utils/ruqqus';
import actions from './actions';

chrome.runtime.onInstalled.addListener(() => {
  Object.keys(actions).forEach((key) => {
    const action = new actions[key]();
    action.onInstalled();
  });
});

const userDetails = {
  authed: false,
  unread: 0,
  user:   null
};

/**
 * @param {number} unread
 */
const setUnread = (unread) => {
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
const resetUserDetails = () => {
  userDetails.authed = false;
  userDetails.unread = 0;
  userDetails.user   = null;
  setUnread(0);
};

/**
 * @returns {Promise<{unread: number, authed: boolean, username: string}>}
 */
const fetchAuth = () => {
  return fetchMe()
    .then(({ authed, unread, username }) => {
      if (!authed) {
        resetUserDetails();
      } else {
        fetchUser(username)
          .then((user) => {
            console.log(unread);
            userDetails.authed = authed;
            userDetails.unread = unread;
            userDetails.user   = user;
            setUnread(unread);
          })
          .catch((err) => {
            console.error(err);
            resetUserDetails();
          });
      }
    })
    .catch((err) => {
      console.error(err);
      resetUserDetails();
    });
};

chrome.alarms.create('fetchAuth', { periodInMinutes: 1.0 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchAuth') {
    fetchAuth();
  }
});

chrome.extension.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    switch (msg.type) {
      case constants.TYPE_UNREAD:
        userDetails.unread = msg.unread;
        setUnread(msg.unread);
        break;
    }
  });

  fetchAuth()
    .then(() => {
      port.postMessage({
        type: constants.TYPE_AUTH,
        ...userDetails
      });
    });
});

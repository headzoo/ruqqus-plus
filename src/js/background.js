import * as constants from './constants';
import { fetchMe, fetchUser } from './utils/ruqqus';

chrome.runtime.onInstalled.addListener(() => {
  const settings = {
    [constants.SETTING_INFINITE_SCROLL]: 1,
    [constants.SETTING_POSTS_NEW_TAB]:   1,
    [constants.SETTING_BIGGER_BUTTONS]:  0
  };
  chrome.storage.sync.set({ settings });
});

const userDetails = {
  authed: false,
  unread: 0,
  user:   null
};

const setUnread = (unread) => {
  if (unread > 0) {
    chrome.browserAction.setBadgeText({ text: unread.toString() });
    chrome.browserAction.setBadgeBackgroundColor({ color: '#E53E3D' });
  } else {
    chrome.browserAction.setBadgeText({ text: '' });
  }
};

const resetUserDetails = () => {
  userDetails.authed = false;
  userDetails.unread = 0;
  userDetails.user   = null;
  setUnread(0);
};

const fetchAuth = () => {
  fetchMe()
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

fetchAuth();
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

  port.postMessage({
    type: constants.TYPE_AUTH,
    ...userDetails
  });
});

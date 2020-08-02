import * as constants from './constants';
import { isAuthenticated, fetchUser } from './utils/ruqqus';

chrome.runtime.onInstalled.addListener(() => {
  const settings = {
    [constants.SETTING_INFINITE_SCROLL]: 1,
    [constants.SETTING_POSTS_NEW_TAB]:   1
  };
  chrome.storage.sync.set({ settings });
});

chrome.storage.sync.get('auth', (value) => {
  if (value) {
    const { username } = value.auth;

    isAuthenticated(username)
        .then((authed) => {
          if (!authed) {
            chrome.storage.sync.set({ user: null });
          } else {
            fetchUser(username)
                .then((user) => {
                  chrome.storage.sync.set({ user });
                })
                .catch((err) => {
                  console.error(err);
                  chrome.storage.sync.set({ user: null });
                });
          }
        });
  }
});

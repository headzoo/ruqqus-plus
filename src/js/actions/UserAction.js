import Action from './Action';
import { fetchMe, fetchUser } from '../utils/ruqqus';
import { userActions } from '../redux/actions';

/**
 * Manages the user account
 */
export default class UserAction extends Action {
  /**
   * @type {{ dispatch: Function, subscribe: Function, getState: Function }}
   */
  store = {};

  /**
   * Called from the background script
   *
   * @param {{ dispatch: Function, subscribe: Function, getState: Function }} store
   */
  execBackgroundContext = (store) => {
    this.store = store;
    this.store.subscribe(() => {
      const { lastAction } = this.store.getState();

      if (lastAction.type === userActions.USER_SET_UNREAD) {
        this.setUnread(lastAction.unread);
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
      .then(({ authed, unread, username }) => {
        if (!authed) {
          this.resetUserDetails();
        } else {
          this.store.dispatch(userActions.setUnread(unread));

          fetchUser(username)
            .then((user) => {
              this.store.dispatch(userActions.setLoading(false));
              this.store.dispatch(userActions.setUser(user));
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
    this.store.dispatch(userActions.setLoading(false));
    this.store.dispatch(userActions.setUnread(0));
    this.store.dispatch(userActions.setUser(null));
  };
}

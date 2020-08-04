export const USER_SET_UNREAD = 'USER_SET_UNREAD';
export const USER_SET_USER   = 'USER_SET_USER';

/**
 * @param {number} unread
 * @returns {{type: string}}
 */
export const setUnread = (unread) => {
  return {
    type: USER_SET_UNREAD,
    unread
  };
};

/**
 * @param {*} user
 * @returns {{type: string, user: *}}
 */
export const setUser = (user) => {
  return {
    type: USER_SET_USER,
    user
  };
};

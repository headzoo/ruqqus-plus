export const USER_LOADING      = 'USER_LOADING';
export const USER_SET_UNREAD   = 'USER_SET_UNREAD';
export const USER_SET_USERNAME = 'USER_SET_USERNAME';
export const USER_SET_USER     = 'USER_SET_USER';

/**
 * @param {boolean} loading
 * @returns {{type: string, loading: boolean}}
 */
export const setLoading = (loading) => {
  return {
    type: USER_LOADING,
    loading
  };
};

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
 * @param {string} username
 * @returns {{type: string, username: *}}
 */
export const setUsername = (username) => {;
  return {
    type: USER_SET_USERNAME,
    username
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

import createReducer from './utils/createReducer';
import * as types from '../actions/userActions';

const initialState = {
  unread:   0,
  user:     null,
  username: '',
  loading:  true
};

/**
 * @param {*} state
 * @param {*} action
 */
const onLoading = (state, action) => {
  return {
    ...state,
    loading: action.loading
  };
};

/**
 * @param {*} state
 * @param {*} action
 */
const onSetUnread = (state, action) => {
  return {
    ...state,
    unread: action.unread
  };
};

/**
 * @param {*} state
 * @param {*} action
 */
const onSetUsername = (state, action) => {
  return {
    ...state,
    username: action.username
  };
};

/**
 * @param {*} state
 * @param {*} action
 */
const onSetUser = (state, action) => {
  return {
    ...state,
    user: action.user
  };
};

const handlers = {
  [types.USER_LOADING]:      onLoading,
  [types.USER_SET_UNREAD]:   onSetUnread,
  [types.USER_SET_USERNAME]: onSetUsername,
  [types.USER_SET_USER]:     onSetUser
};

export default createReducer(initialState, handlers);

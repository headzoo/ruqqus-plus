import cloneDeep from 'clone-deep';

/**
 * @param {*} initialState
 * @param {*} handlers
 * @returns {Function}
 */
const createReducer = (initialState, handlers) => {
  return (state = cloneDeep(initialState), action = {}) => {
    if (handlers[action.type]) {
      return handlers[action.type].call(null, state, action);
    }

    return state;
  };
};

export default createReducer;

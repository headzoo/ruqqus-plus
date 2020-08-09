/**
 * @param {Array} array
 * @param {string} key
 * @param {*} value
 * @returns {number}
 */
export const searchByObjectKey = (array, key, value) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return i;
    }
  }

  return -1;
};

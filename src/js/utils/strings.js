/**
 *
 * @param {string} str
 * @param {number} maxLen
 * @param {string} dots
 * @returns {string}
 */
export const truncateString = (str, maxLen, dots = '...') => {
  if (str.length <= maxLen) {
    return str;
  }
  return `${str.substr(0, maxLen)}${dots}`;
};

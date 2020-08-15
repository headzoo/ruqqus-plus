/**
 * @returns {string}
 */
export const getLoaderURL = () => {
  if (chrome && chrome.runtime) {
    return chrome.runtime.getURL('images/loading.svg');
  }
  return '';
};

/**
 * @param {boolean} isLoading
 */
export default function loader(isLoading) {
  if (chrome && chrome.runtime) {
    if (isLoading) {
      const img = new Image();
      img.src = getLoaderURL();
      img.classList.add('rp-loader');
      document.querySelector('body').appendChild(img);
    } else {
      document.querySelectorAll('.rp-loader').forEach((el) => {
        el.remove();
      });
    }
  }
}

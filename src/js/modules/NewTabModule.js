import Module from './Module';

/**
 * Opens posts in a new tab.
 */
export default class NewTabModule extends Module {
  /**
   * Returns 1 or 0
   *
   * @returns {number}
   */
  static getDefaultSetting = () => {
    return 0;
  };

  /**
   * @returns {string}
   */
  getLabel = () => {
    return 'Open posts and user profiles in new tab';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.listen('rp.change', this.execContentContext);

    const hrefs = [];
    document.querySelectorAll('.card-title a').forEach((link) => {
      hrefs.push(link.getAttribute('href'));
    });
    hrefs.forEach((href) => {
      document.querySelectorAll(`a[href="${href}"]`).forEach((link) => {
        link.setAttribute('target', '_blank');
      });
    });
    document.querySelectorAll('.user-name').forEach((link) => {
      link.setAttribute('target', '_blank');
    });
    document.querySelectorAll('.comment-text a').forEach((link) => {
      link.setAttribute('target', '_blank');
    });
    document.querySelectorAll('.comment-actions a').forEach((link) => {
      if (link.innerText === 'Context') {
        link.setAttribute('target', '_blank');
      }
    });
  };
}

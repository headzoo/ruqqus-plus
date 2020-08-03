import Module from './Module';

/**
 * Opens posts in a new tab.
 */
export default class PostsNewTabModule extends Module {
  /**
   * @returns {string}
   */
  getLabel = () => {
    return 'Open Posts In New Tab';
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
    document.querySelectorAll('#posts .card-title a').forEach((link) => {
      hrefs.push(link.getAttribute('href'));
    });
    hrefs.forEach((href) => {
      document.querySelectorAll(`a[href="${href}"]`).forEach((link) => {
        link.setAttribute('target', '_blank');
      });
    });
  };
}

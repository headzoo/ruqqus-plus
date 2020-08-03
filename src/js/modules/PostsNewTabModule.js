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
   * Called in the content script
   */
  execContentContext = () => {
    this.listen('rp.change', this.execContentContext);

    const links = document.querySelectorAll('#posts .card-title a');
    if (!links) {
      return;
    }

    links.forEach((link) => {
      link.setAttribute('target', '_blank');
    });
  };
}

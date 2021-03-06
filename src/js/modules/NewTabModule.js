import Module from './Module';

/**
 * Opens posts in a new tab.
 */
export default class NewTabModule extends Module {
  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {boolean}
   */
  static isEnabledByDefault = () => {
    return false;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'New Tab';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Opens post and user links in a new tab.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.listen('rp.change', this.wireupLinks);

    this.onDOMReady(this.wireupLinks);
  };

  /**
   *
   */
  wireupLinks = () => {
    // Ensure post links get target="_blank" everywhere they appear on the page.
    const hrefs = [];
    document.querySelectorAll('.card-title a').forEach((link) => {
      hrefs.push(link.getAttribute('href'));
    });
    hrefs.forEach((href) => {
      this.html.querySelectorAttribs(`a[href="${href}"]`, {
        'target': '_blank'
      });
    });

    this.html.querySelectorAttribs('.user-name', {
      'target': '_blank'
    });
    this.html.querySelectorAttribs('.comment-text a', {
      'target': '_blank'
    });
    this.html.querySelectorAttribs('.post-meta-guild a', {
      'target': '_blank'
    });
    this.html.querySelectorEach('.comment-actions a', (link) => {
      if (link.innerText === 'Context') {
        link.setAttribute('target', '_blank');
      }
    });
  };
}

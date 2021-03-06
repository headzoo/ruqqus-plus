import Module from './Module';

/**
 * Opens posts in a new tab.
 */
export default class HideVotedPostsModule extends Module {
  /**
   * @type {*[]}
   */
  posts = [];

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
    return 'Hide Voted Posts';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'After voting on a post it will no longer show up in your feeds.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.onDOMReady(() => {
      this.removeCards();
      this.listen('rp.change', this.removeCards);
    });
  };

  /**
   *
   */
  removeCards = () => {
    this.html.querySelectorEach('.posts .card', (card) => {
      if (card.classList.contains('upvoted') || card.classList.contains('downvoted')) {
        card.remove();
      }
    });
  };
}

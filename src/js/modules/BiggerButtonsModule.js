import Module from './Module';

/**
 * Makes the up/down vote buttons bigger
 */
export default class BiggerButtonsModule extends Module {
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
    return 'Bigger Buttons';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Makes the vote buttons bigger.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.html.injectCSS(`
      .downvote-button::before,
      .upvote-button::before {
        font-size: 1.4rem;
      }

      .score,
      .score-up,
      .score-down {
        font-size: 1rem;
      }
    `);
  };
}

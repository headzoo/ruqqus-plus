import Module from './Module';
import { injectCSS } from '../utils/web';

/**
 * Makes the up/down vote buttons bigger
 */
export default class BiggerButtonsModule extends Module {
  /**
   * @returns {string}
   */
  getLabel = () => {
    return 'Bigger Vote Buttons';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    injectCSS(`
      .downvote-button::before,
      .upvote-button::before {
        font-size: 1.5rem;
      }
      .score {
        font-size: 1rem;
      }
    `);
  };
}

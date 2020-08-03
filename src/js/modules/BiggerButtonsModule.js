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
   * Called in the content script
   */
  execContentContext = () => {
    injectCSS(`
      .downvote-button::before,
      .upvote-button::before {
        font-size: 1.5rem;
      }
    `);
  };
}

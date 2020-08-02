import Module from './Module';
import * as constants from '../constants';
import { injectCSS } from '../utils/web';

/**
 * Makes the up/down vote buttons bigger
 */
export default class BiggerButtonsModule extends Module {
  /**
   * @returns {string}
   */
  getSettings = () => {
    return `
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          name="${constants.SETTING_BIGGER_BUTTONS}"
          class="custom-control-input"
          id="setting-bigger-buttons"
        />
        <label class="custom-control-label" for="setting-bigger-buttons">
          Bigger Vote Buttons
        </label>
      </div>`;
  };

  /**
   * Called in the content script
   */
  execContent = () => {
    injectCSS(`
      .downvote-button::before,
      .upvote-button::before {
        font-size: 1.5rem;
      }
    `);
  };
}

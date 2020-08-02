import Module from './Module';
import * as constants from '../constants';

/**
 * Opens posts in a new tab.
 */
export default class PostsNewTabModule extends Module {
  /**
   * @returns {string}
   */
  getSettings = () => {
    return `
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          name="${constants.SETTING_POSTS_NEW_TAB}"
          class="custom-control-input"
          id="setting-posts-new-tab"
        />
        <label class="custom-control-label" for="setting-posts-new-tab">
          Open Posts In New Tab
        </label>
      </div>`;
  };

  /**
   * Called in the content script
   */
  execContent = () => {
    this.listen('rp.change', this.execContent);

    const links = document.querySelectorAll('#posts .card-title a');
    if (!links) {
      return;
    }

    links.forEach((link) => {
      link.setAttribute('target', '_blank');
    });
  };
}

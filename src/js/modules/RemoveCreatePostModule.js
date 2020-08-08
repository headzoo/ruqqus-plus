import Module from './Module';
import { extractGuildName } from '../utils/ruqqus';
import { injectCSS, insertAfter, createElement } from '../utils/web';

/**
 * Removes the "create post" input
 */
export default class RemoveCreatePostModule extends Module {
  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {boolean}
   */
  static getDefaultSetting = () => {
    return false;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'Remove "Create Post" input';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Replaces the "Create Post" input from the top of every feed with a discreet button.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    injectCSS(`
      .pseudo-submit-form { display: none; }
      .guild-border-top .text-small.font-weight-bold { white-space: nowrap; }
    `);

    this.onDOMReady(() => {
      const top = document.querySelector('.guild-border-top');
      if (top) {
        let guild = 'general';
        if (document.location.pathname.indexOf('/+') === 0) {
          guild = extractGuildName(document.location.pathname);
        }

        const unsub   = document.getElementById('button-unsub');
        const actions = top.querySelectorAll('.dropdown-actions');
        if (unsub || (actions && actions.length > 1)) {
          const button  = createElement('a', {
            'href':  `/submit?guild=${guild}`,
            'class': 'btn btn-primary btn-block',
            'html':  '<i class="fas fa-pen mr-1"></i> Submit'
          });
          if (unsub) {
            unsub.classList.add('mr-2');
            insertAfter(unsub, button);
          } else {
            actions[1].classList.add('mr-2');
            insertAfter(actions[1], button);
          }
        }
      }
    });
  };
}

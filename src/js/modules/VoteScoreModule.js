import Module from './Module';
import { querySelectorEach, createElement, insertAfter, injectCSS } from '../utils/web';

/**
 * Makes the vote score +/- move visible
 */
export default class VoteScoreModule extends Module {
  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {boolean}
   */
  static isEnabledByDefault = () => {
    return true;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'Vote Score';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Makes the vote score +/- more visible';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    injectCSS(`
      .rp-vote-score-up { color: #805ad5; }
      .rp-vote-score-down { color: #38b2ac; }
    `);

    this.listen('rp.change', this.wireupLinks);
    this.onDOMReady(this.wireupLinks);
  };

  /**
   *
   */
  wireupLinks = () => {
    querySelectorEach('.posts .card', (card) => {
      const score = card.querySelector('.voting *[data-original-title]');
      if (score && !score.getAttribute('data-rp-vote-score-wired')) {
        const title = score.getAttribute('data-original-title');
        const metas = card.querySelectorAll('.post-meta-guild');
        const span  = this.createSpan(title);
        insertAfter(metas[1], span);
        score.setAttribute('data-rp-vote-score-wired', 'true');
      }
    });

    querySelectorEach('.rp-popup-posts-post .card', (card) => {
      const score = card.querySelector('.voting *[data-original-title]');
      if (score && !score.getAttribute('data-rp-vote-score-wired')) {
        const title = score.getAttribute('data-original-title');
        const meta  = card.querySelector('.post-meta');
        const span  = this.createSpan(title);
        meta.prepend(span);
        score.setAttribute('data-rp-vote-score-wired', 'true');
      }
    });
  };

  /**
   * @param {string} title
   * @returns {HTMLElement}
   */
  createSpan = (title) => {
    const parts = this.extractScore(title);
    return createElement('span', {
      'html': `
        <span class="rp-vote-score-up">${parts.up}</span>/<span class="rp-vote-score-down">${parts.down}</span>
        &middot;&nbsp;`
    });
  };

  /**
   * @param {string} title
   * @returns {{up: string, down: string}}
   */
  extractScore = (title) => {
    const parts = title.split(' | ');

    return {
      up:   parts[0],
      down: parts[1]
    };
  };
}

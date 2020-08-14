import Module from './Module';
import { querySelectorEach, createElement, insertAfter, insertBefore, injectCSS } from '../utils/web';
import storage from '../utils/storage';
import SettingsModal from './VoteScoreModule/SettingsModal';

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
   * Returns a react component that will be displayed in a modal
   */
  getSettingsModal = () => {
    return SettingsModal;
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
    storage.get('VoteScoreModule.display', 'scores')
      .then((display) => {
        this.display = display;

        querySelectorEach('.posts .card', (card) => {
          const voting = card.querySelector('.voting *[data-original-title]');
          if (voting && !voting.getAttribute('data-rp-vote-score-wired')) {
            const score = parseInt(card.querySelector('.score').innerText, 10);
            const title = voting.getAttribute('data-original-title');
            const metas = card.querySelectorAll('.post-meta-guild');
            const span  = this.createSpan(title, score);
            insertAfter(metas[1], span);
            voting.setAttribute('data-rp-vote-score-wired', 'true');
          }
        });

        querySelectorEach('.comment', (comment) => {
          const points = comment.querySelector('.points');
          if (points && !points.getAttribute('data-rp-vote-score-wired')) {
            const score     = parseInt(comment.querySelector('.score').innerText, 10);
            const title     = points.getAttribute('data-original-title');
            const timeStamp = comment.querySelector('.time-stamp');
            const span      = this.createSpan(title, score, false);
            insertBefore(timeStamp, span);
            points.setAttribute('data-rp-vote-score-wired', 'true');
          }
        });

        querySelectorEach('.rp-popup-posts-post .card', (card) => {
          const voting = card.querySelector('.voting *[data-original-title]');
          if (voting && !voting.getAttribute('data-rp-vote-score-wired')) {
            const score = parseInt(card.querySelector('.score').innerText, 10);
            const title = voting.getAttribute('data-original-title');
            const meta  = card.querySelector('.post-meta');
            const span  = this.createSpan(title, score);
            meta.prepend(span);
            voting.setAttribute('data-rp-vote-score-wired', 'true');
          }
        });
      });
  };

  /**
   * @param {string} title
   * @param {number} score
   * @param {boolean} dotsAfter
   * @returns {HTMLElement}
   */
  createSpan = (title, score, dotsAfter = true) => {
    const parts = this.extractScore(title);
    if (this.display === 'score') {
      return createElement('span', {
        'html': `
        ${dotsAfter ? '' : '&nbsp;&middot;'}
        <span class="rp-vote-score-up">+${parts.up}</span>/<span class="rp-vote-score-down">-${parts.down}</span>
        ${dotsAfter ? '&middot;&nbsp;' : ''}`
      });
    }

    let percent;
    if (score === 0 && parts.up === parts.down) {
      percent = 0;
    } else {
      percent = Math.floor((score / parts.up) * 100);
    }

    return createElement('span', {
      'html': `
        ${dotsAfter ? '' : '&nbsp;&middot;'}
        (%${percent})
        ${dotsAfter ? '&middot;&nbsp;' : ''}`
    });
  };

  /**
   * @param {string} title
   * @returns {{up: number, down: number}}
   */
  extractScore = (title) => {
    const parts = title.split(' | ');

    return {
      up:   parseInt(parts[0].replace('+', ''), 10),
      down: parseInt(parts[1].replace('-', ''), 10)
    };
  };
}

import queryString from 'query-string';
import Module from './Module';
import * as constants from '../constants';

const EVENT_WIREUP_CARD = 'rp.InfiniteScrollModule.wireupCard';

/**
 * Adds infinite scroll to post pages.
 */
export default class InfiniteScrollModule extends Module {
  /**
   * @type {number}
   * @private
   */
  page = 1;

  /**
   * @type {string}
   * @private
   */
  sort = 'new';

  /**
   * @type {string}
   * @private
   */
  type = 'all';

  /**
   * @type {HTMLElement}
   * @private
   */
  posts = null;

  /**
   * @returns {string}
   */
  getSettings = () => {
    return `
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          name="${constants.SETTING_INFINITE_SCROLL}"
          class="custom-control-input"
          id="setting-infinite-scroll"
        />
        <label class="custom-control-label" for="setting-infinite-scroll">
          Infinite Scroll
        </label>
      </div>`;
  };

  /**
   * Called in the content script
   */
  execContentContext = () => {
    this.posts = document.getElementById('posts');
    if (!this.posts) {
      return;
    }

    const pageLinks = document.querySelectorAll('.page-link');
    if (!pageLinks || pageLinks.length < 2) {
      console.error('No page link found.');
      return;
    }
    const href = pageLinks[1].getAttribute('href');
    if (!href) {
      console.log('End of feed.');
      return;
    }

    const parsed = queryString.parse(href);
    this.page    = parsed.page;
    this.sort    = parsed.sort;
    this.type    = parsed.t;
    if (!this.page) {
      this.page = 2;
    }

    const observer = new IntersectionObserver(this.handleIntersect, {
      rootMargin: '0px',
      threshold:  1.0
    });
    const cards = this.posts.querySelectorAll('.card');
    observer.observe(cards[cards.length - 1]);
  };

  /**
   * Called in the context of the page
   */
  execWindowContext = () => {
    this.listen(EVENT_WIREUP_CARD, this.handleWireupCard);
  };

  /**
   * @param {IntersectionObserverEntry[]} entries
   * @param {IntersectionObserver} observer
   * @private
   */
  handleIntersect = (entries, observer) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      fetch(`?sort=${this.sort}&page=${this.page}&t=${this.type}`)
        .then((resp) => resp.text())
        .then((text) => {
          const template     = document.createElement('template');
          template.innerHTML = text;

          const cards = template.content.querySelectorAll('#posts .card');
          if (cards && cards.length > 0) {
            cards.forEach((card) => {
              this.posts.appendChild(card);
              this.dispatch(EVENT_WIREUP_CARD, {
                id: card.getAttribute('id')
              });
            });

            this.page += 1;
            observer.disconnect();
            observer.observe(cards[cards.length - 1]);
          }

          this.dispatch('rp.change');
        });
    }
  };

  /**
   * @param {CustomEvent} e
   * @see https://github.com/ruqqus/ruqqus/blob/7477b2d088560f2ac39e723821e8bd7be11087fa/ruqqus/assets/js/all_js.js#L1030
   */
  handleWireupCard = (e) => {
    const { upvote, downvote } = window;

    const card           = document.getElementById(e.detail.id);
    const upvoteButton   = card.querySelector('.upvote-button');
    const downvoteButton = card.querySelector('.downvote-button');

    upvoteButton.addEventListener('click', upvote, false);
    upvoteButton.addEventListener('keydown', (event) => {
      if (event.keyCode === 13) {
        upvote(event);
      }
    }, false);

    downvoteButton.addEventListener('click', downvote, false);
    downvoteButton.addEventListener('keydown', (event) => {
      if (event.keyCode === 13) {
        downvote(event);
      }
    }, false);
  };
}

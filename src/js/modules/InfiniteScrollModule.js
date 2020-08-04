import queryString from 'query-string';
import { insertAfter } from '../utils/web';
import Module from './Module';

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
   * @type {HTMLElement}
   * @private
   */
  loading = null;

  /**
   * Returns 1 or 0
   *
   * @returns {number}
   */
  static getDefaultSetting = () => {
    return 1;
  };

  /**
   * @returns {string}
   */
  getLabel = () => {
    return 'Infinite scroll';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
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

    pageLinks[0].style.display = 'none';
    pageLinks[1].style.display = 'none';
    this.loading = document.createElement('img');
    this.loading.setAttribute('src', chrome.runtime.getURL('images/loading.svg'));
    this.loading.setAttribute('style', 'display: none;');
    insertAfter(pageLinks[1], this.loading);

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
   * Called from the script injected into the page
   *
   * Code run from here has access to the ruqqus `window` object but not the
   * chrome extension API.
   */
  execWindowContext = () => {
    this.listen('rp.InfiniteScrollModule.wireupCard', this.handleWireupCard);
  };

  /**
   * Called when the bottom of the page is reached
   *
   * @param {IntersectionObserverEntry[]} entries
   * @param {IntersectionObserver} observer
   * @private
   */
  handleIntersect = (entries, observer) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      this.loading.style.display = 'block';
      fetch(`?sort=${this.sort}&page=${this.page}&t=${this.type}`)
        .then((resp) => resp.text())
        .then((text) => {
          const template     = document.createElement('template');
          template.innerHTML = text;

          const cards = template.content.querySelectorAll('#posts .card');
          if (cards && cards.length > 0) {
            cards.forEach((card) => {
              this.posts.appendChild(card);
              this.dispatch('rp.InfiniteScrollModule.wireupCard', {
                id: card.getAttribute('id')
              });
            });

            this.page += 1;
            observer.disconnect();
            observer.observe(cards[cards.length - 1]);
          }

          this.dispatch('rp.change');
        })
        .finally(() => {
          this.loading.style.display = 'none';
        });
    }
  };

  /**
   * Adds event listeners to new cards. This must be done from the window context to have
   * access to the window.upvote() and window.downvote() functions.
   *
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

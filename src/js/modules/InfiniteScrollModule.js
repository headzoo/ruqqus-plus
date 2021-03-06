import queryString from 'query-string';
import { getLoaderURL } from '../utils/loader';
import Module from './Module';

/**
 * Adds infinite scroll to post pages.
 */
export default class InfiniteScrollModule extends Module {
  /**
   * @type {number}
   */
  page = 1;

  /**
   * @type {string}
   */
  sort = 'new';

  /**
   * @type {string}
   */
  type = 'all';

  /**
   * @type {string}
   */
  q = '';

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
    return 'Infinite Scroll';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Automatically fetches the next page of post when you reach the bottom of the page.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.onDOMReady(() => {
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
      this.loading.setAttribute('src', getLoaderURL());
      this.loading.setAttribute('style', 'display: none;');
      this.html.insertAfter(pageLinks[1], this.loading);

      const parsed = queryString.parse(href);
      this.page    = parseInt(parsed.page || 0, 10);
      this.sort    = parsed.sort;
      this.type    = parsed.t;
      this.q       = parsed.q;
      if (!this.page) {
        this.page = 2;
      }

      const observer = new IntersectionObserver(this.handleIntersect, {
        rootMargin: '0px',
        threshold:  1.0
      });
      const cards = this.posts.querySelectorAll('.card');
      observer.observe(cards[cards.length - 1]);
    });
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

      fetch(`https://ruqqus.com${document.location.pathname}?sort=${this.sort}&page=${this.page}&t=${this.type}&q=${this.q}`)
        .then((resp) => resp.text())
        .then((text) => {
          const template = this.html.createElement('template', {
            'html': text
          });

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
    const image          = card.querySelector('.post-img');

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

    // createElement used in handleIntersect strips out the inline JS ruqqus included.
    // We have to add it back for image popups to work.
    if (image) {
      const src      = image.getAttribute('src');
      const possible = ['i.ruqqus.com', 'imgur.com', 'cdn.discordapp.com', 'media.giphy.com'];
      for (let i = 0; i < possible.length; i++) {
        if (src.includes(possible[i])) {
          const a = image.closest('a');
          if (a) {
            const link = a.getAttribute('href');
            image.setAttribute(
              'onclick',
              `if (!window.__cfRLUnblockHandlers) return false; expandDesktopImage('${link}','${link}')`
            );
          }
        }
      }

      // createElement also removes the target attribute.
      const link = image.closest('a');
      link.setAttribute('target', '_blank');
    }
  };
}

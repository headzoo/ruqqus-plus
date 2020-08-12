import Module from './Module';
import { createElement, injectScript } from '../utils/web';
import { isPostPage } from '../utils/ruqqus';

/**
 * Enhances the way media (images, videos) are displayed on the site
 */
export default class BetterMediaModule extends Module {
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
    return 'Better Media';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Enhances the way media (images, videos) are displayed on the site';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.listen('rp.change', this.wireup);

    this.onDOMReady(this.wireup);
  };

  /**
   *
   */
  wireup = () => {
    if (isPostPage()) {
      this.wireupPost();
    } else {
      this.wireupCards();
    }
  };

  /**
   *
   */
  wireupPost = () => {
    const voting = document.getElementById('voting');
    const card   = voting.closest('.card');
    if (card) {
      const postBody = card.querySelector('#post-body');
      const anchor   = card.querySelector('.post-title a');
      const href     = anchor.getAttribute('href');
      const mediaUrl = new URL(href);

      const supportedMediaHosts = {
        'gfycat.com':   this.handleGfycat,
        'i.imgur.com':  this.handleImgur,
        'i.ruqqus.com': this.handleRuqqus
      };
      const handler = supportedMediaHosts[mediaUrl.hostname];
      if (handler !== undefined) {
        handler.call(this, postBody, mediaUrl);
      }
    }
  };

  /**
   *
   */
  wireupCards = () => {
    console.log('cards');
  };

  /**
   * @param {HTMLElement} postBody
   * @param {URL} mediaUrl
   */
  handleGfycat = (postBody, mediaUrl) => {
    // @see https://developers.gfycat.com/iframe/
    const iframe = createElement('iframe', {
      'src':             `${mediaUrl.protocol}//${mediaUrl.hostname}/ifr${mediaUrl.pathname}`,
      'frameborder':     0,
      'scrolling':       'no',
      'width':           640,
      'height':          453,
      'class':           'rp-better-media-iframe',
      'allowfullscreen': 'allowfullscreen'
    });
    postBody.appendChild(iframe);
  };

  /**
   * @param {HTMLElement} postBody
   * @param {URL} mediaUrl
   */
  handleImgur = (postBody, mediaUrl) => {
    // @see https://help.imgur.com/hc/en-us/articles/211273743-Embed-Unit
    const match = mediaUrl.toString().match(/^https:\/\/i.imgur.com\/(.*?)\./);
    if (!match) {
      return;
    }

    const container = createElement('blockquote', {
      'class':   'imgur-embed-pub',
      'data-id': match[1],
      'lang':    'en'
    });
    const anchor = createElement('a', {
      'href': `https://imgur.com/${match[1]}`
    });
    container.appendChild(anchor);
    postBody.appendChild(container);

    injectScript('//s.imgur.com/min/embed.js');
  };

  /**
   * @param {HTMLElement} postBody
   * @param {URL} mediaUrl
   */
  handleRuqqus = (postBody, mediaUrl) => {
    const img = this.createImageContainer(mediaUrl.toString());
    postBody.appendChild(img);
  };

  /**
   * @param {string} href
   * @returns {HTMLElement}
   */
  createImageContainer = (href) => {
    const container = createElement('a', {
      'class':  'rp-better-media-image-container rp-better-media-collapsed',
      'href':   href,
      'target': '_blank',
      'rel':    'nofollow noreferrer'
    });
    const img = new Image();
    const handleImageLoad = () => {
      const containerRect   = container.getBoundingClientRect();
      container.style.width = `${img.width}px`;

      if (img.height > containerRect.height) {
        const overflow = createElement('div', {
          'class': 'rp-better-media-overflow post-title',
          'text':  'Click to see more'
        });
        container.appendChild(overflow);
        overflow.addEventListener('click', (e) => {
          e.preventDefault();
          container.classList.remove('rp-better-media-collapsed');
          overflow.remove();
        }, false);
      }
    };
    img.addEventListener('load', handleImageLoad, false);
    img.src = href;
    container.appendChild(img);

    return container;
  };
}

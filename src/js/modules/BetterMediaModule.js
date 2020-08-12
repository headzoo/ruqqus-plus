import Module from './Module';
import { createElement, injectScript } from '../utils/web';
import { isPostPage } from '../utils/ruqqus';
import { favIcons, favIconsKeys } from './BetterMediaModule/favicons';

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
      if (anchor) {
        const href     = anchor.getAttribute('href');
        const mediaUrl = new URL(href);

        const supportedMediaHosts = {
          'gfycat.com':         this.handleGfycat,
          'i.imgur.com':        this.handleImgur,
          'i.ruqqus.com':       this.handleRuqqus,
          'open.spotify.com':   this.handleSpotify,
          'twitter.com':        this.handleTwitter,
          'mobile.twitter.com': this.handleTwitter
        };

        const handler = supportedMediaHosts[mediaUrl.hostname];
        if (handler !== undefined) {
          handler.call(this, postBody, mediaUrl);
        } else {
          const ext = mediaUrl.pathname.split('.').pop().toLowerCase();
          if (['jpg', 'jpeg', 'gif', 'png'].indexOf(ext) !== -1) {
            const img = this.createImageContainer(mediaUrl);
            postBody.appendChild(img);
          }
        }
      } else {
        console.warn('No anchor found for card', card);
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
    const fluid = document.querySelector('.img-fluid');
    if (fluid) {
      fluid.closest('.row').remove();
    }
    const img = this.createImageContainer(mediaUrl);
    postBody.appendChild(img);
  };

  /**
   * @param {HTMLElement} postBody
   * @param {URL} mediaUrl
   */
  handleTwitter = (postBody, mediaUrl) => {
    const container = createElement('blockquote', {
      'class': 'twitter-tweet',
      'lang':  'en'
    });
    const anchor = createElement('a', {
      'href': mediaUrl.toString().replace('mobile.', '')
    });
    container.appendChild(anchor);
    postBody.appendChild(container);

    injectScript('//platform.twitter.com/widgets.js');
  };

  /**
   * @param {HTMLElement} postBody
   * @param {URL} mediaUrl
   */
  handleSpotify = (postBody, mediaUrl) => {
    // @see https://community.spotify.com/t5/Desktop-Windows/URI-Codes/td-p/4479486
    let src;
    const match = mediaUrl.toString().match(/\/(playlist|album|artist|track)\/([\w\d]+)/i);
    if (match) {
      src = `https://open.spotify.com/embed?uri=spotify:${match[1]}:${match[2]}`;
    }

    if (src) {
      const iframe = createElement('iframe', {
        'src':             src,
        'frameborder':     0,
        'scrolling':       'no',
        'width':           300,
        'height':          380,
        'allowfullscreen': 'allowfullscreen'
      });
      postBody.appendChild(iframe);
    }
  };

  /**
   * @param {URL} mediaUrl
   * @returns {HTMLElement}
   */
  createImageContainer = (mediaUrl) => {
    const outer     = createElement('div', {
      'class': 'd-flex flex-column'
    });
    const container = createElement('a', {
      'class':  'rp-better-media-image-container rp-better-media-collapsed',
      'href':   mediaUrl.toString(),
      'target': '_blank',
      'rel':    'nofollow noreferrer'
    });
    const img = new Image();
    const handleImageLoad = () => {
      const containerRect   = container.getBoundingClientRect();
      outer.style.width = `${img.width}px`;

      const diff = img.height - containerRect.height;
      if (diff > 0 && diff > 50) {
        const overflow = createElement('div', {
          'class': 'rp-better-media-overflow post-title',
          'text':  'Click to see more'
        });
        container.appendChild(overflow);
        overflow.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          container.classList.remove('rp-better-media-collapsed');
          overflow.remove();
        }, false);
      } else {
        container.classList.remove('rp-better-media-collapsed');
      }
    };
    img.addEventListener('load', handleImageLoad, false);
    img.src = mediaUrl.toString();
    container.appendChild(img);
    outer.appendChild(container);

    let icon;
    for (let i = 0; i < favIconsKeys.length; i++) {
      if (mediaUrl.hostname.indexOf(favIconsKeys[i]) !== -1) {
        icon = favIcons[favIconsKeys[i]];
        break;
      }
    }
    const attrib = createElement('div', {
      'class': 'rp-better-media-attrib',
      'html':  icon ? `<img src="${icon}" class="mr-2" alt="Icon" /> ${mediaUrl.hostname}` : mediaUrl.hostname
    });
    outer.appendChild(attrib);

    return outer;
  };
}

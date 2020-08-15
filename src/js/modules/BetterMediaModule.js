import Module from './Module';
import { isPostPage } from '../utils/ruqqus';
import loader, { getLoaderURL } from '../utils/loader';
import { favIcons, favIconsKeys } from './BetterMediaModule/favicons';

/**
 * Enhances the way media (images, videos) are displayed on the site
 */
export default class BetterMediaModule extends Module {
  /**
   * @type {string}
   */
  lastHref = '';

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
          'gfycat.com':         this.createGfycat,
          'www.redgifs.com':    this.createRedGifs,
          'i.imgur.com':        this.createImgur,
          'imgur.com':          this.createImgur,
          'i.ruqqus.com':       this.createRuqqus,
          'open.spotify.com':   this.createSpotify,
          'twitter.com':        this.createTwitter,
          'mobile.twitter.com': this.createTwitter
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
    this.html.querySelectorEach('.card-header a', (a) => {
      const href = a.getAttribute('href');
      if (href && href.indexOf('http') === 0) {
        const supportedMediaHosts = {
          'imgur.com':       this.handleAnchorImgur,
          'www.redgifs.com': this.handleAnchorRedGifs,
          'redgifs.com':     this.handleAnchorRedGifs,
          'gfycat.com':      this.handleAnchorGfycat
        };

        const mediaUrl = new URL(href);
        const handler  = supportedMediaHosts[mediaUrl.hostname];
        if (handler !== undefined) {
          a.addEventListener('click', handler, false);
        } else {
          const ext = mediaUrl.pathname.split('.').pop().toLowerCase();
          if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) !== -1) {
            a.addEventListener('click', this.handleAnchorImage, false);
          }
        }
      }
    });
  };

  /**
   * @param {*} e
   */
  handleAnchorImage = (e) => {
    const mediaUrl = this.getClickedAnchorURL(e);
    if (mediaUrl) {
      const popup = this.createPopup();
      const img   = this.createImageContainer(mediaUrl);
      popup.appendChild(img);
    }
  };

  /**
   * @param {*} e
   */
  handleAnchorImgur = (e) => {
    const { currentTarget } = e;

    let src;
    const href = currentTarget.getAttribute('href');
    if (this.lastHref === href) {
      return;
    }
    this.lastHref = href;

    let match  = href.match(/^https:\/\/imgur.com\/a\/(.*)/);
    if (match) {
      src = `https://api.imgur.com/3/album/${match[1]}.json`;
    } else {
      match = href.match(/^https:\/\/imgur.com\/gallery\/(.*)/);
      if (match) {
        src = `https://api.imgur.com/3/gallery/${match[1]}.json`;
      } else {
        match = href.match(/^https:\/\/imgur.com\/(.*)/);
        if (match) {
          src = `https://api.imgur.com/3/image/${match[1]}.json`;
        }
      }
    }

    if (src) {
      e.preventDefault();

      loader(true);
      fetch(src, {
        headers: {
          'Authorization': 'Client-ID 92b389723993e50'
        }
      })
        .then((resp) => resp.json())
        .then((json) => {
          if (json.success) {
            let { link } = json.data;
            if (json.data.images) {
              link = json.data.images[0].link;
            }

            currentTarget.setAttribute('href', link);
            currentTarget.setAttribute('data-target', '#expandImageModal');
            currentTarget.setAttribute('data-toggle', 'modal');
            const img = currentTarget.querySelector('img');
            img.setAttribute(
              'onclick',
              `if (!window.__cfRLUnblockHandlers) return false; expandDesktopImage('${link}','${link}')`
            );
            setTimeout(() => {
              img.click();
            }, 100);
          }
        })
        .finally(() => {
          loader(false);
        });
    }
  };

  /**
   * @param {*} e
   */
  handleAnchorRedGifs = (e) => {
    const mediaUrl = this.getClickedAnchorURL(e);
    if (mediaUrl) {
      const popup = this.createPopup();
      this.createRedGifs(popup, mediaUrl);
    }
  };

  /**
   * @param {*} e
   */
  handleAnchorGfycat = (e) => {
    const mediaUrl = this.getClickedAnchorURL(e);
    if (mediaUrl) {
      const popup = this.createPopup();
      this.createGfycat(popup, mediaUrl);
    }
  };

  /**
   * @param {*} e
   * @returns {URL}
   */
  getClickedAnchorURL = (e) => {
    const { currentTarget } = e;

    const href = currentTarget.getAttribute('href');
    if (this.lastHref === href) {
      return null;
    }
    this.lastHref = href;
    e.preventDefault();

    return new URL(href);
  }

  /**
   * @param {HTMLElement} postBody
   * @param {URL} mediaUrl
   */
  createGfycat = (postBody, mediaUrl) => {
    // @see https://developers.gfycat.com/iframe/
    const frame = this.createFrameContainer(mediaUrl, {
      'src':             `${mediaUrl.protocol}//${mediaUrl.hostname}/ifr${mediaUrl.pathname}`,
      'frameborder':     0,
      'scrolling':       'no',
      'width':           640,
      'height':          453,
      'class':           'rp-better-media-iframe',
      'allowfullscreen': 'allowfullscreen'
    });
    postBody.appendChild(frame);
  };

  /**
   * @param {HTMLElement} postBody
   * @param {URL} mediaUrl
   */
  createRedGifs = (postBody, mediaUrl) => {
    const frame = this.createFrameContainer(mediaUrl, {
      'src':             `${mediaUrl.protocol}//${mediaUrl.hostname}/ifr${mediaUrl.pathname.replace('/watch', '')}`,
      'frameborder':     0,
      'scrolling':       'no',
      'width':           640,
      'height':          453,
      'class':           'rp-better-media-iframe',
      'allowfullscreen': 'allowfullscreen'
    });
    postBody.appendChild(frame);
  };

  /**
   * @param {HTMLElement} postBody
   * @param {URL} mediaUrl
   */
  createImgur = (postBody, mediaUrl) => {
    // @see https://help.imgur.com/hc/en-us/articles/211273743-Embed-Unit
    let id;
    let match = mediaUrl.toString().match(/^https:\/\/i.imgur.com\/(.*?)\./);
    if (match) {
      // eslint-disable-next-line prefer-destructuring
      id = match[1];
    } else {
      match = mediaUrl.toString().match(/^https:\/\/imgur.com\/(a|gallery)\/(.*)/);
      if (match) {
        id = `a/${match[2]}`;
      } else {
        match = mediaUrl.toString().match(/^https:\/\/imgur.com\/(.*)/);
        if (match) {
          // eslint-disable-next-line prefer-destructuring
          id = match[1];
        }
      }
    }

    if (id) {
      const src       = getLoaderURL();
      const container = this.html.createElement('blockquote', {
        'class':   'imgur-embed-pub rp-better-media-blockquote',
        'data-id': id,
        'lang':    'en',
        'html':    `<img class="rp-better-media-load" src="${src}" alt="Loading" />`
      });
      const anchor = this.html.createElement('a', {
        'href': `https://imgur.com/${id}`
      });
      container.appendChild(anchor);
      postBody.appendChild(container);

      this.html.injectScript('//s.imgur.com/min/embed.js');
    }
  };

  /**
   * @param {HTMLElement} postBody
   * @param {URL} mediaUrl
   */
  createRuqqus = (postBody, mediaUrl) => {
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
  createTwitter = (postBody, mediaUrl) => {
    const container = this.html.createElement('blockquote', {
      'class': 'twitter-tweet rp-better-media-blockquote',
      'lang':  'en',
      'html':  `<img class="rp-better-media-load" src="${getLoaderURL()}" alt="Load" />`
    });
    const anchor = this.html.createElement('a', {
      'href': mediaUrl.toString().replace('mobile.', '')
    });
    container.appendChild(anchor);
    postBody.appendChild(container);

    this.html.injectScript('//platform.twitter.com/widgets.js');
  };

  /**
   * @param {HTMLElement} postBody
   * @param {URL} mediaUrl
   */
  createSpotify = (postBody, mediaUrl) => {
    // @see https://community.spotify.com/t5/Desktop-Windows/URI-Codes/td-p/4479486
    let src;
    const match = mediaUrl.toString().match(/\/(playlist|album|artist|track)\/([\w\d]+)/i);
    if (match) {
      src = `https://open.spotify.com/embed?uri=spotify:${match[1]}:${match[2]}`;
    }

    if (src) {
      const frame = this.createFrameContainer(mediaUrl, {
        'src':             src,
        'frameborder':     0,
        'scrolling':       'no',
        'width':           300,
        'height':          380,
        'allowfullscreen': 'allowfullscreen'
      });
      postBody.appendChild(frame);
    }
  };

  /**
   * @param {URL} mediaUrl
   * @param {*} attribs
   * @returns {HTMLElement}
   */
  createFrameContainer = (mediaUrl, attribs) => {
    const src       = getLoaderURL();
    const container = this.html.createElement('div', {
      'html': `<img class="rp-better-media-load" src="${src}" alt="Loading" />`
    });
    const iframe = this.html.createElement('iframe', attribs);
    iframe.style.display = 'none';
    iframe.addEventListener('load', () => {
      container.querySelector('.rp-better-media-load').remove();
      iframe.style.display = 'block';
    });
    container.appendChild(iframe);

    const attrib = this.createAttribute(mediaUrl);
    container.appendChild(attrib);

    return container;
  }

  /**
   * @param {URL} mediaUrl
   * @returns {HTMLElement}
   */
  createImageContainer = (mediaUrl) => {
    const outer     = this.html.createElement('div', {
      'class': 'd-flex flex-column',
      'style': 'max-width: 250px'
    });
    const container = this.html.createElement('a', {
      'class':  'rp-better-media-image-container rp-better-media-collapsed',
      'href':   mediaUrl.toString(),
      'target': '_blank',
      'rel':    'nofollow noreferrer',
      'html':   `<img class="rp-better-media-load" src="${getLoaderURL()}" alt="Load" />`
    });
    const img = new Image();
    const handleImageLoad = () => {
      outer.style.maxWidth = 'none';
      outer.style.width    = `${img.width}px`;
      container.querySelector('.rp-better-media-load').remove();
      const outerRect = outer.getBoundingClientRect();

      if (img.clientHeight > outerRect.height) {
        const overflow = this.html.createElement('div', {
          'class': 'rp-better-media-overflow post-title',
          'text':  'Click To Expand'
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

    const attrib = this.createAttribute(mediaUrl);
    outer.appendChild(attrib);

    return outer;
  };

  /**
   * @returns {HTMLElement}
   */
  createPopup = () => {
    const body = document.querySelector('body');
    body.style.overflow = 'hidden';

    const mask = this.html.createElement('div', {
      'class': 'rp-better-media-mask'
    });
    body.appendChild(mask);
    const container = this.html.createElement('div', {
      'class': 'rp-better-media-popup-container'
    });
    body.append(container);
    const content = this.html.createElement('div', {
      'class': 'rp-better-media-popup-content'
    });

    container.appendChild(content);
    container.addEventListener('click', () => {
      content.remove();
      container.remove();
      mask.remove();
      body.style.overflow = 'auto';
    }, false);

    return content;
  };

  /**
   * @param {URL} mediaUrl
   * @returns {HTMLElement}
   */
  createAttribute = (mediaUrl) => {
    let icon;
    for (let i = 0; i < favIconsKeys.length; i++) {
      if (mediaUrl.hostname.indexOf(favIconsKeys[i]) !== -1) {
        icon = favIcons[favIconsKeys[i]];
        break;
      }
    }

    return this.html.createElement('a', {
      'class':  'rp-better-media-attrib',
      'href':   mediaUrl.toString(),
      'target': '_blank',
      'html':   icon ? `<img src="${icon}" class="mr-2" alt="Icon" /> ${mediaUrl.hostname}` : mediaUrl.hostname
    });
  };
}

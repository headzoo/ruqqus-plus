import Module from './Module';
import { isPostPage } from '../utils/ruqqus';
import loader, { getLoaderURL } from '../utils/loader';
import { favIcons, favIconsKeys } from './BetterMediaModule/favicons';
import SettingsModal from './BetterMediaModule/SettingsModal';
import defaultSettings from './BetterMediaModule/defaultSettings';
import storage from '../utils/storage';

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
const videoExtensions = ['mp4', 'webm', 'gifv'];

/**
 * Enhances the way media (images, videos) are displayed on the site
 */
export default class BetterMediaModule extends Module {
  /**
   * @type {{}}
   */
  imgurCache = {};

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
   * Returns a react component that will be displayed in a modal
   */
  getSettingsModal = () => {
    return SettingsModal;
  };

  /**
   * Called when the user exports the extension data
   *
   * Should return all values that have been saved by the controller or module. Should
   * return a falsy value when the controller/module has nothing to export.
   *
   * @returns {Promise}
   */
  exportData = async () => {
    return storage.getNamespace('BetterMediaModule');
  };

  /**
   * Called when the user imports extension data
   *
   * Will receive the values saved for the controller or module.
   *
   * @param {*} data
   * @returns {Promise}
   */
  importData = async (data) => {
    return storage.setNamespace('BetterMediaModule', data);
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
    storage.get('BetterMediaModule.settings', defaultSettings)
      .then((settings) => {
        this.settings = { ...defaultSettings, ...settings };
        if (settings.watchPosts && isPostPage()) {
          this.wireupPost();
        } else if (settings.watchThumbs) {
          this.wireupCards();
        }
      });
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
    const { popups } = this.settings;

    this.html.querySelectorEach('.card-header a', (a) => {
      const href = a.getAttribute('href');
      if (href && href.indexOf('http') === 0) {
        const supportedMediaHosts = {
          'imgur.com':       popups.imgur.enabled ? this.handleAnchorImgur : null,
          'www.redgifs.com': popups.redgifs.enabled ? this.handleAnchorRedGifs : null,
          'redgifs.com':     popups.redgifs.enabled ? this.handleAnchorRedGifs : null,
          'gfycat.com':      popups.gfycat.enabled ? this.handleAnchorGfycat : null,
          'i.ruqqus.com':    popups.ruqqus.enabled ? this.handleAnchorImage : null,
          'youtube.com':     popups.youtube.enabled ? this.handleAnchorYoutube : null,
          'youtu.be':        popups.youtube.enabled ? this.handleAnchorYoutube : null
        };

        const mediaUrl  = new URL(href);
        const extension = mediaUrl.pathname.split('.').pop().toLowerCase();
        const handler   = supportedMediaHosts[mediaUrl.hostname];
        if (handler || imageExtensions.indexOf(extension) !== -1 || videoExtensions.indexOf(extension) !== -1) {
          a.removeAttribute('data-toggle');
          a.removeAttribute('data-target');
          this.html.query(a, 'img').removeAttribute('onclick');

          if (handler !== undefined) {
            if (handler !== null) {
              a.addEventListener('click', handler, false);
            }
          } else if (popups.other.enabled && imageExtensions.indexOf(extension) !== -1) {
            a.addEventListener('click', this.handleAnchorImage, false);
          } else if (popups.other.enabled) {
            a.addEventListener('click', this.handleAnchorVideo, false);
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
      const img   = this.createImageContainer(mediaUrl, false);
      popup.appendChild(img);
    }
  };

  /**
   * @param {*} e
   */
  handleAnchorVideo = (e) => {
    const mediaUrl = this.getClickedAnchorURL(e);
    if (mediaUrl) {
      const popup = this.createPopup();
      const img   = this.createVideoContainer(mediaUrl);
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

      const displayImage = (link) => {
        const popup = this.createPopup();
        const img   = this.createImageContainer(new URL(link), false);
        popup.appendChild(img);
      };

      if (this.imgurCache[href]) {
        displayImage(this.imgurCache[href]);
      } else {
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

              displayImage(link);
              this.imgurCache[href] = link;
            }
          })
          .finally(() => {
            loader(false);
          });
      }
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
   */
  handleAnchorYoutube = (e) => {
    const mediaUrl = this.getClickedAnchorURL(e);
    if (mediaUrl) {
      const popup = this.createPopup();
      this.createYoutube(popup, mediaUrl, 1);
    }
  };

  /**
   * @param {*} e
   * @returns {URL}
   */
  getClickedAnchorURL = (e) => {
    const { currentTarget } = e;

    e.preventDefault();
    const href = currentTarget.getAttribute('href');

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
   * @param {number} autoplay
   */
  createYoutube = (postBody, mediaUrl, autoplay = 0) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match  = mediaUrl.toString().match(regExp);
    const id     = (match && match[7].length === 11) ? match[7] : false;
    if (id) {
      const frame = this.createFrameContainer(mediaUrl, {
        'src':             `https://www.youtube.com/embed/${id}?autoplay=${autoplay}`,
        'frameborder':     0,
        'scrolling':       'no',
        'width':           800,
        'height':          450,
        'class':           'rp-better-media-iframe',
        'allowfullscreen': 'allowfullscreen'
      });
      postBody.appendChild(frame);
    }
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
   * @param {boolean} collapsed
   * @returns {HTMLElement}
   */
  createImageContainer = (mediaUrl, collapsed = true) => {
    const outer     = this.html.createElement('div', {
      'class': 'd-flex flex-column',
      'style': 'max-width: 250px'
    });
    const container = this.html.createElement('a', {
      'class':  'rp-better-media-image-container rp-better-media-collapsed text-center',
      'href':   mediaUrl.toString(),
      'target': '_blank',
      'rel':    'nofollow noreferrer',
      'html':   `<img class="rp-better-media-load" src="${getLoaderURL()}" alt="Load" />`
    });
    const img = new Image();
    const handleImageLoad = () => {
      outer.style.maxWidth = 'none';
      if (img.naturalWidth < (window.innerWidth - 400)) {
        outer.style.width = `${img.naturalWidth < 801 ? img.naturalWidth : 800}px`;
      } else {
        outer.style.width = `${img.width}px`;
      }
      container.querySelector('.rp-better-media-load').remove();
      const outerRect = outer.getBoundingClientRect();

      if (collapsed && img.clientHeight > outerRect.height) {
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
   * @param {URL} mediaUrl
   */
  createVideoContainer = (mediaUrl) => {
    const outer = this.html.createElement('div', {
      'class': 'd-flex flex-column'
    });
    const container = this.html.createElement('a', {
      'class':  'rp-better-media-video-container text-center',
      'href':   mediaUrl.toString(),
      'target': '_blank',
      'rel':    'nofollow noreferrer',
      'html':   `<img class="rp-better-media-load" src="${getLoaderURL()}" alt="Load" />`
    });
    const video = this.html.createElement('video', {
      'autoplay': 'true',
      'loop':     'loop',
      'controls': 'controls'
    });

    const handleVideoLoad = () => {
      container.querySelector('.rp-better-media-load').remove();
    };
    video.addEventListener('loadstart', handleVideoLoad, false);
    video.src = mediaUrl.toString();

    container.appendChild(video);
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

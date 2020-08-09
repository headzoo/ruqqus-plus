import Module from './Module';
import { createElement, querySelectorEach, hasParentClass } from '../utils/web';
import { isDarkMode } from '../utils/ruqqus';

/**
 * Opens posts in a popup window
 */
export default class PopupPostsModule extends Module {
  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {boolean}
   */
  static isEnabledByDefault = () => {
    return false;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'Popup Posts';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Opens posts in a popup window.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.onDOMReady(() => {
      this.listen('rp.change', this.wireupCards);
      this.wireupCards();
    });
  };

  /**
   * Called from the script injected into the page
   *
   * Code from here has access to the ruqqus `window` object but not the
   * chrome extension API.
   */
  execWindowContext = () => {
    this.listen('rp.popupPosts.events', () => {
      // @see https://github.com/ruqqus/ruqqus/blob/master/ruqqus/assets/js/all_js.js#L1019
      $('.comment-box').focus(function (event) {
        event.preventDefault();
        $(this).parent().parent().addClass("collapsed");
      });

      var upvoteButtons = document.getElementsByClassName('upvote-button');
      var downvoteButtons = document.getElementsByClassName('downvote-button');
      var voteDirection = 0;
      for (var i = 0; i < upvoteButtons.length; i++) {
        upvoteButtons[i].addEventListener('click', upvote, false);
        upvoteButtons[i].addEventListener('keydown', function(event) {
          if (event.keyCode === 13) {
            upvote(event)
          }
        }, false)
      };
      for (var i = 0; i < downvoteButtons.length; i++) {
        downvoteButtons[i].addEventListener('click', downvote, false);
        downvoteButtons[i].addEventListener('keydown', function(event) {
          if (event.keyCode === 13) {
            downvote(event)
          }
        }, false)
      };
    });
  }

  /**
   *
   */
  wireupCards = () => {
    querySelectorEach('.card-title a', (a) => {
      if (!a.getAttribute('rp-popup-post-wired')) {
        a.setAttribute('rp-popup-post-wired', true);
        a.addEventListener('click', this.handleTitleClick, false);
      }
    });
  };

  /**
   * @param {Event} e
   */
  handleTitleClick = (e) => {
    e.preventDefault();

    const href = e.target.getAttribute('href');
    this.popup(href);
  };

  /**
   * @param {string} url
   */
  popup = (url) => {
    this.loader(true);
    fetch(url)
      .then((resp) => resp.text())
      .then((text) => {
        const body = document.querySelector('body');
        body.style.overflow = 'hidden';

        const template = document.createElement('template');
        template.innerHTML = text;
        const html = template.content;
        // const html = createTemplateContent(text);
        const col  = html.querySelector('#main-content-col');
        col.classList.add('rp-popup-posts-col');
        col.querySelector('.guild-border-top').classList.add('rp-popup-posts-guild');
        if (isDarkMode()) {
          col.classList.add('rp-popup-posts-dark');
        }

        const mask = createElement('div', {
          'class': 'rp-popup-posts-mask'
        });
        body.appendChild(mask);

        const container = createElement('div', {
          'class': 'rp-popup-posts-container'
        });
        body.append(container);

        const post = createElement('div', {
          'class': 'rp-popup-posts-post'
        });
        container.append(post);
        post.append(col);
        this.loader(false);
        this.dispatch('rp.popupPosts.events');

        const handleContainerClick = (e) => {
          if (!hasParentClass(e.target, 'rp-popup-posts-post')) {
            container.removeEventListener('click', handleContainerClick, false);
            container.remove();
            mask.remove();
            body.style.overflow = 'auto';
          }
        };
        container.addEventListener('click', handleContainerClick, false);
      });
  };

  /**
   * @param {boolean} show
   */
  loader = (show) => {
    if (!show) {
      const l = document.querySelector('.rp-popup-posts-loader');
      if (l) {
        l.remove();
      }
      return;
    }

    const img = createElement('img', {
      'src':   chrome.runtime.getURL('images/loading.svg'),
      'class': 'rp-popup-posts-loader'
    });
    document.querySelector('body').appendChild(img);
  }
}

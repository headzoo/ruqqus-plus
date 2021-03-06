import Module from './Module';
import { isPostPage } from '../utils/ruqqus';
import loader from '../utils/loader';

/**
 * Opens posts in a popup window
 */
export default class PopupPostsModule extends Module {
  /**
   * @type {string}
   */
  lastTitle = '';

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
      if (!isPostPage()) {
        this.listen('rp.change', this.wireupCards);
        this.wireupCards();
      }
    });
  };

  /**
   * Called from the script injected into the page
   *
   * Code from here has access to the ruqqus `window` object but not the
   * chrome extension API.
   */
  execWindowContext = () => {
    this.listen('rp.PopupPostsModule.events', () => {
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

      $(document).ready(function(){
        $('[data-toggle="tooltip"]').tooltip();
      });
    });
  }

  /**
   *
   */
  wireupCards = () => {
    this.html.querySelectorEach('.card-title a', (a) => {
      if (!a.getAttribute('rp-popup-post-wired')) {
        a.setAttribute('rp-popup-post-wired', true);
        a.addEventListener('click', this.handleTitleClick, false);
      }
    });
  };

  /**
   * @param {MouseEvent} e
   */
  handleTitleClick = (e) => {
    if (!isPostPage()) {
      e.preventDefault();
      const { target } = e;

      const href  = target.getAttribute('href');
      const title = target.innerText;
      const thumb = target.closest('.card').querySelector('.post-img');
      this.popup(href, title, thumb ? thumb.getAttribute('src') : '');
    }
  };

  /**
   * @param {string} url
   * @param {string} title
   * @param {string} thumb
   */
  popup = (url, title, thumb) => {
    this.lastTitle = document.title;
    loader(true);

    fetch(url)
      .then((resp) => resp.text())
      .then((text) => {
        const body = document.querySelector('body');
        body.style.overflow = 'hidden';

        const template = document.createElement('template');
        template.innerHTML = text;
        const html = template.content;

        const col  = html.querySelector('#main-content-col');
        col.classList.add('rp-popup-posts-col');
        col.querySelector('.guild-border-top').classList.add('rp-popup-posts-guild');

        const mask = this.html.createElement('div', {
          'class': 'rp-popup-posts-mask'
        });
        body.appendChild(mask);
        const container = this.html.createElement('div', {
          'class': 'rp-popup-posts-container'
        });
        body.append(container);
        const post = this.html.createElement('div', {
          'class': 'rp-popup-posts-post'
        });
        container.append(post);
        post.append(col);
        post.querySelector('#voting').classList.add('mt-0');
        this.html.querySelectorEach(post, '.post-filter .dropdown-item', (a) => {
          a.addEventListener('click', this.handlePostFilterClick, false);
        });

        document.title = title;
        window.history.pushState(null, document.title, url);
        this.dispatch('rp.PopupPostsModule.events', { url, title, thumb });
        this.dispatch('rp.change');
        loader(false);

        /**
         * @param {Event} e
         */
        const handleContainerClick = (e) => {
          if (!this.html.hasParentClass(e.target, 'rp-popup-posts-post')) {
            container.removeEventListener('click', handleContainerClick, false);
            container.remove();
            mask.remove();

            body.style.overflow = 'auto';
            window.history.back();
            setTimeout(() => {
              document.title = this.lastTitle;
            }, 250);
          }
        };
        container.addEventListener('click', handleContainerClick, false);
      });
  };

  /**
   * @param {Event} e
   */
  handlePostFilterClick = (e) => {
    const { currentTarget } = e;
    e.preventDefault();

    const href = currentTarget.getAttribute('href');
    const root = new URL(document.location.href);

    loader(true);
    fetch(`${root.protocol}//${root.hostname}${root.pathname}${href}`)
      .then((resp) => resp.text())
      .then((text) => {
        const template = document.createElement('template');
        template.innerHTML = text;
        const html = template.content;

        const commentSection = html.querySelector('.comment-section');
        const oldSection     = document.querySelector('.comment-section');
        oldSection.parentNode.replaceChild(commentSection, oldSection);
        this.html.querySelectorEach('.post-filter .dropdown-item', (a) => {
          a.addEventListener('click', this.handlePostFilterClick, false);
        });
      })
      .finally(() => {
        loader(false);
      });
  };
}

import marked from 'marked';
import Module from './Module';

/**
 * Adds a preview pane to the post submit page
 */
export default class PreviewPostModule extends Module {
  /**
   * @type {HTMLElement}
   */
  link = null;

  /**
   * @type {HTMLElement}
   */
  textarea = null;

  /**
   * @type {boolean}
   */
  isPreviewing = false;

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
    return 'Preview Post';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Adds a preview button to the submit a post page which lets you see the post with formatting.';
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
    const comments = document.querySelector('.comment-section');
    if (comments) {
      this.html.querySelectorEach(comments, '.comment-actions span', (span) => {
        if (span.textContent === 'Reply') {
          const link = span.closest('a');
          if (link) {
            const actions = link.closest('.comment-actions');
            if (actions) {
              const commentId = actions.getAttribute('id').replace('comment-', '').replace('-actions', '');
              link.setAttribute('data-rp-preview-post-reply-id', commentId);
            }
            link.addEventListener('click', this.handleCommentLinkClick, false);
          }
        }
      });

      const topTextarea = document.querySelector('#main-content-col .comment-box');
      if (topTextarea) {
        topTextarea.addEventListener('click', this.handleCommentLinkClick, false);
      }
    }

    if (document.location.pathname === '/submit') {
      const label   = document.querySelector('label[for="body"]');
      this.textarea = document.getElementById('post-text');
      this.link     = this.html.createElement('a', {
        'style': 'float: right;',
        'class': 'mt-3',
        'href':  'javascript:void(0)', // eslint-disable-line
        'html':  '<i class="fas fa-eye"></i> Preview',
        'on':    {
          'click': this.handlePostLinkClick
        }
      });
      label.parentNode.insertBefore(this.link, label);
    }
  };

  /**
   * @param {Event} e
   */
  handlePostLinkClick = (e) => {
    e.preventDefault();

    if (!this.isPreviewing) {
      const container = this.textarea.closest('.input-group');
      const html      = marked(this.textarea.value);

      const div = this.html.createElement('div', {
        'class': 'rp-preview-post-container rounded',
        'html':  html
      });

      this.textarea.style.display = 'none';
      container.appendChild(div);

      this.isPreviewing = true;
      this.html.setHTML(this.link, '<i class="fas fa-edit"></i> Edit');
    } else {
      document.querySelector('.rp-preview-post-container').remove();
      this.isPreviewing           = false;
      this.textarea.style.display = 'block';
      this.html.setHTML(this.link, '<i class="fas fa-eye"></i> Preview');
    }
  };

  /**
   * @param {*} e
   */
  handleCommentLinkClick = (e) => {
    const { currentTarget } = e;
    e.preventDefault();
    e.stopPropagation();

    setTimeout(() => {
      let textarea;
      let commentId;
      if (currentTarget.tagName === 'TEXTAREA') {
        textarea = currentTarget;
      } else {
        commentId = currentTarget.getAttribute('data-rp-preview-post-reply-id');
        textarea  = document.querySelector(`#reply-to-${commentId} .comment-box`);
      }

      if (textarea) {
        const nextSibling = textarea.nextElementSibling;
        if (textarea && nextSibling.classList.contains('comment-format')) {
          this.html.query('.rp-preview-post-format').remove();
          const format = this.html.createElement('small', {
            'class': 'format rp-preview-post-format rp-pointer',
            'title': 'Preview',
            'html':  '<i class="fas fa-eye"></i> Preview'
          });

          /**
           * @param {*} ee
           */
          const handleClick = (ee) => {
            ee.preventDefault();
            ee.stopPropagation();

            if (!textarea.getAttribute('rp-preview-post-previewing')) {
              const html = marked(textarea.value);
              const div  = this.html.createElement('div', {
                'class': 'rp-preview-post-container rounded',
                'html':  html
              });
              textarea.style.display = 'none';
              this.html.insertAfter(textarea, div);
              this.html.setHTML(format, '<i class="fas fa-edit"></i> Edit');
              format.setAttribute('title', 'Edit');

              textarea.setAttribute('rp-preview-post-previewing', 'true');
            } else {
              textarea.closest('form').querySelector('.rp-preview-post-container').remove();
              textarea.style.display = 'block';
              this.html.setHTML(format, '<i class="fas fa-eye"></i> Preview');
              format.setAttribute('title', 'Preview');

              textarea.removeAttribute('rp-preview-post-previewing');
            }
          };

          format.addEventListener('click', handleClick, false);
          const formats = textarea.nextElementSibling.querySelectorAll('.format');
          this.html.insertAfter(formats[formats.length - 1], format);
        }
      }
    }, 100);
  };
}

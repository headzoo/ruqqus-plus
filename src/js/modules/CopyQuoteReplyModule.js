import Module from './Module';

/**
 * Automatically quotes the selected text into a new reply
 */
export default class CopyQuoteReplyModule extends Module {
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
    return 'Copy Quote Reply';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Automatically quotes the selected text into a new reply';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.listen('rp.change', this.wireupLinks);

    this.onDOMReady(this.wireupLinks);
  };

  /**
   *
   */
  wireupLinks = () => {
    const comments = document.querySelector('.comment-section');
    if (!comments) {
      return;
    }

    this.html.querySelectorEach(comments, '.comment-actions span', (span) => {
      if (span.textContent === 'Reply') {
        const link = span.closest('a');
        if (link) {
          const actions = link.closest('.comment-actions');
          if (actions) {
            const commentId = actions.getAttribute('id').replace('comment-', '').replace('-actions', '');
            link.setAttribute('data-rp-copy-quote-reply-id', commentId);
          }
          link.addEventListener('click', this.handleLinkClick, false);
        }
      }
    });
  };

  /**
   * @param {Event} e
   */
  handleLinkClick = (e) => {
    const { currentTarget } = e;

    const commentId = currentTarget.getAttribute('data-rp-copy-quote-reply-id');
    if (commentId) {
      setTimeout(() => {
        const text = this.html.getSelectionText();
        const textarea = document.querySelector(`#reply-to-${commentId} .comment-box`);
        if (textarea) {
          if (text) {
            textarea.value = `> ${text}\n\n`;
          }

          // Set the caret at the end of the textarea.
          setTimeout(() => {
            textarea.focus();
            // eslint-disable-next-line no-multi-assign
            textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
          }, 0);
        }
      }, 100);
    }
  };
}

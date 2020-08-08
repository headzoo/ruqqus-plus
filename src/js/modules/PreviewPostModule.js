import marked from 'marked';
import Module from './Module';
import { isDarkMode } from '../utils/ruqqus';
import { createElement, setHTML } from '../utils/web';

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
  static getDefaultSetting = () => {
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
    if (document.location.pathname !== '/submit') {
      return;
    }

    this.onDOMReady(() => {
      const label   = document.querySelector('label[for="body"]');
      this.textarea = document.getElementById('post-text');
      this.link     = createElement('a', {
        'style': 'float: right;',
        'class': 'mt-3',
        'href':  'javascript:void(0)', // eslint-disable-line
        'html':  '<i class="fas fa-eye"></i> Preview',
        'on':    {
          'click': this.handleLinkClick
        }
      });
      label.parentNode.insertBefore(this.link, label);
    });
  };

  /**
   * @param {Event} e
   */
  handleLinkClick = (e) => {
    e.preventDefault();

    if (!this.isPreviewing) {
      const container = this.textarea.closest('.input-group');
      const html      = marked(this.textarea.value);

      const div = createElement('div', {
        'class': 'rp-preview-post-container rounded',
        'html':  html
      });
      if (isDarkMode()) {
        div.classList.add('rp-preview-post-container-dark');
      }

      this.textarea.style.display = 'none';
      container.appendChild(div);

      this.isPreviewing = true;
      setHTML(this.link, '<i class="fas fa-edit"></i> Edit');
    } else {
      document.querySelector('.rp-preview-post-container').remove();
      this.isPreviewing           = false;
      this.textarea.style.display = 'block';
      setHTML(this.link, '<i class="fas fa-eye"></i> Preview');
    }
  };
}

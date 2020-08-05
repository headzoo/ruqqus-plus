import marked from 'marked';
import Module from './Module';
import { isDarkMode } from '../utils/ruqqus';
import { setAttributes } from '../utils/web';

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
   * Returns 1 or 0
   *
   * @returns {number}
   */
  static getDefaultSetting = () => {
    return 1;
  };

  /**
   * @returns {string}
   */
  getLabel = () => {
    return 'Adds a preview pane to the post submit page';
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

    const label   = document.querySelector('label[for="body"]');
    this.textarea = document.getElementById('post-text');
    this.link     = document.createElement('a');
    setAttributes(this.link, {
      'style': 'float: right;',
      'class': 'mt-3',
      'href':  'javascript:void(0)', // eslint-disable-line
      'html':  '<i class="fas fa-eye"></i> Preview'
    });
    label.parentNode.insertBefore(this.link, label);
    this.link.addEventListener('click', this.handleLinkClick, false);
  };

  /**
   * @param {Event} e
   */
  handleLinkClick = (e) => {
    e.preventDefault();

    if (!this.isPreviewing) {
      const container = this.textarea.closest('.input-group');
      const html      = marked(this.textarea.value);

      const div = document.createElement('div');
      setAttributes(div, {
        'class': 'rp-preview-post-container rounded',
        'html':  html
      });
      if (isDarkMode()) {
        div.classList.add('rp-preview-post-container-dark');
      }

      this.textarea.style.display = 'none';
      container.appendChild(div);

      this.isPreviewing   = true;
      this.link.innerHTML = '<i class="fas fa-edit"></i> Edit';
    } else {
      document.querySelector('.rp-preview-post-container').remove();
      this.textarea.style.display = 'block';
      this.link.innerHTML         = '<i class="fas fa-eye"></i> Preview';
      this.isPreviewing           = false;
    }
  };
}

import Module from './Module';
import { getLoaderURL } from '../utils/loader';

/**
 * Fixes the broken cross posts frame
 */
export default class FixCrossPostModule extends Module {
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
    return 'Fix Cross Post';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Fixes the broken cross posts frame.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.listen('rp.change', this.execContentContext);

    const post = document.querySelector('#post-body');
    if (post) {
      const iframe = post.querySelector('iframe');
      if (iframe && iframe.src.indexOf('https://ruqqus.com/embed/post') === 0) {
        const img = new Image();
        img.src   = getLoaderURL();

        const responsive = document.querySelector('.embed-responsive');
        this.html.insertBefore(responsive, img);
        responsive.classList.remove('embed-responsive-16by9');

        iframe.style.display = 'none';
        iframe.classList.add('rp-fix-cross-post-iframe');
        iframe.addEventListener('load', () => {
          const doc = iframe.contentDocument || iframe.contentWindow.document;

          // Fix the height of the iframe.
          doc.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
              iframe.height       = `${doc.body.scrollHeight + 15}px`;
              iframe.style.height = iframe.height;
              responsive.style.height = iframe.height;
            }, 150);
          }, false);

          // Fixes dark mode not being honored in the iframe.
          const style = doc.getElementById('css-link');
          style.setAttribute('href', document.getElementById('css-link').getAttribute('href'));

          // Finally show the frame.
          setTimeout(() => {
            img.remove();
            iframe.style.display = 'block';
          }, 150);
        }, false);
      }
    }
  };
}

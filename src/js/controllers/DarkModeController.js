import Controller from './Controller';
import { isDarkMode } from '../utils/ruqqus';

/**
 * Watches for dark/light mode and adds classes.
 */
export default class DarkModeController extends Controller {
  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.onDOMReady(() => {
      if (isDarkMode()) {
        document.querySelector('body').classList.add('rp-dark-mode');
      }

      const s    = document.getElementById('dark-switch');
      const link = s.closest('.dropdown-item');
      if (link) {
        link.addEventListener('click', this.handleSwitchClick);
      }
    });
  };

  /**
   *
   */
  handleSwitchClick = () => {
    setTimeout(() => {
      if (isDarkMode()) {
        document.querySelector('body').classList.add('rp-dark-mode');
      } else {
        document.querySelector('body').classList.remove('rp-dark-mode');
      }
    }, 250);
  };
}

import moment from 'moment';
import Module from './Module';
import { fetchUser } from '../utils/ruqqus';
import { createElement, setHTML, querySelectorEach } from '../utils/web';
import { parseTemplate } from '../utils/templates';
import { getLoaderURL } from '../utils/loader';
import userTemplate from './UserInfoModule/user-template.html';

/**
 * Displays user information when hovering over their username
 */
export default class UserInfoModule extends Module {
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
    return 'User Info';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Displays details about a user when you hover the mouse pointer over their username.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.listen('rp.change', this.wireupUserNames);
    this.onDOMReady(this.wireupUserNames);
  };

  /**
   *
   */
  wireupUserNames = () => {
    querySelectorEach('.user-name', (el) => {
      if (!el.getAttribute('data-rp-user-info')) {
        el.setAttribute('data-rp-user-info', 'true');
        el.addEventListener('mouseenter', this.handleMouseEnter, false);
        el.addEventListener('mouseleave', this.handleMouseLeave, false);
      }
    });
  };

  /**
   * @param {MouseEvent} e
   */
  handleMouseEnter = (e) => {
    const { target } = e;

    const userName    = target.getAttribute('href').replace('/@', '');
    const rect        = target.getBoundingClientRect();
    const existingBox = document.querySelector(`[data-userInfo-username="${userName}"]`);
    if (existingBox) {
      existingBox.setAttribute('style', `top: ${rect.top + 20}px; left: ${rect.left}px`);
      existingBox.style.display = 'block';
    } else {
      const box  = createElement('div', {
        'class':                  'rp-user-info-box',
        'style':                  `top: ${rect.top + 20}px; left: ${rect.left}px`,
        'html':                   `<img src="${getLoaderURL()}" alt="Loading" />`,
        'data-userInfo-username': userName
      });
      document.querySelector('body').appendChild(box);

      fetchUser(userName)
        .then((user) => {
          if (!user) {
            this.handleMouseLeave();
            return;
          }

          user.joined = moment(parseInt(user.created_utc, 10) * 1000).format('D MMM YYYY');
          user.rep    = parseInt(user.post_rep, 10) + parseInt(user.comment_rep, 10);
          const html  = parseTemplate(userTemplate, user);
          setHTML(box, html);
        });
    }
  };

  /**
   *
   */
  handleMouseLeave = () => {
    querySelectorEach('.rp-user-info-box', (el) => {
      el.style.display = 'none';
    });
  };
}

import moment from 'moment';
import Module from './Module';
import { fetchUser } from '../utils/ruqqus';
import { injectStyleLink } from '../utils/web';

/**
 * Displays user information when hovering over their username
 */
export default class UserInfoModule extends Module {
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
    return 'Show user info when hovering over their username';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.listen('rp.change', this.wireupUserNames);

    injectStyleLink(chrome.runtime.getURL('css/user-info-styles.css'));
    this.wireupUserNames();
  };

  /**
   *
   */
  wireupUserNames = () => {
    const userNames = document.querySelectorAll('.user-name');
    userNames.forEach((userName) => {
      if (!userName.getAttribute('data-rp-user-info')) {
        userName.setAttribute('data-rp-user-info', 'true');
        userName.addEventListener('mouseenter', this.handleMouseEnter, false);
        userName.addEventListener('mouseleave', this.handleMouseLeave, false);
      }
    });
  };

  /**
   * @param {*} values
   * @returns {string}
   */
  getBoxTemplate = (values) => {
    let html = `
      <div class="d-flex align-items-center">
          <img src="%%profile_url%%" alt="Avatar" id="container-authed-avatar" class="avatar mr-2" />
          <div class="d-flex flex-column">
              <span id="container-authed-username" class="username mr-2">%%username%%</span>
              <div>
                  <span id="container-authed-rep" class="rep">%%rep%% Rep</span>
                  &nbsp;&nbsp;
                  <span id="container-joined" class="joined">joined %%joined%%</span>
              </div>
          </div>
      </div>
    `;

    Object.keys(values).forEach((key) => {
      const r = new RegExp(`%%${key}%%`, 'g');
      html = html.replace(r, values[key]);
    });

    return html;
  }

  /**
   * returns {boolean}
   */
  isDarkMode = () => {
    const link = document.getElementById('css-link');
    if (!link) {
      return false;
    }

    return link.getAttribute('href').indexOf('dark') !== -1;
  };

  /**
   * @param {MouseEvent} e
   */
  handleMouseEnter = (e) => {
    const { target } = e;

    const rect = target.getBoundingClientRect();
    const box  = document.createElement('div');
    box.classList.add('rp-userInfo-box');
    if (this.isDarkMode()) {
      box.classList.add('rp-userInfo-box-dark');
    }
    box.setAttribute('style', `top: ${rect.top + 20}px; left: ${rect.left}px`);
    box.innerHTML = `<img src="${chrome.runtime.getURL('images/loading.svg')}" alt="Loading" />`;
    document.querySelector('body').appendChild(box);

    const userName = target.getAttribute('href').replace('/@', '');
    fetchUser(userName)
      .then((user) => {
        if (!user) {
          this.handleMouseLeave();
          return;
        }

        user.joined   = moment(parseInt(user.created_utc, 10) * 1000).format('D MMM YYYY');
        user.rep      = parseInt(user.post_rep, 10) + parseInt(user.comment_rep, 10);
        box.innerHTML = this.getBoxTemplate(user);
      });
  };

  /**
   *
   */
  handleMouseLeave = () => {
    const box = document.querySelectorAll('.rp-userInfo-box');
    if (box) {
      box.forEach((b) => {
        b.remove();
      });
    }
  };
}

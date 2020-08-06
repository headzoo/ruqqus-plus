import Module from './Module';
import { fetchMyGuilds } from '../utils/ruqqus';
import { createElement, querySelectorEach } from '../utils/web';
import storage from '../utils/storage';

/**
 * Enhanced the ruqqus sidebar
 */
export default class BetterSidebarModule extends Module {
  /**
   * @type {[]}
   */
  guilds = null;

  /**
   * @type {HTMLElement}
   */
  filterInput = null;

  /**
   * @type {HTMLElement}
   */
  sidebar = null;

  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {boolean}
   */
  static getDefaultSetting = () => {
    return false;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'Sidebar enhancements';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Lists all of your guilds in the sidebar with and provides an input to filter them.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.sidebar = document.querySelector('.sidebar-left');
    if (this.sidebar) {
      this.updateFilter();

      // Guilds are cached in storage for 10 minutes.
      storage.get('guilds')
        .then((guilds) => {
          if (guilds) {
            this.guilds = guilds.guilds;
            this.updateSidebar();
          } else {
            fetchMyGuilds()
              .then((g) => {
                this.guilds = g;
                storage.set('guilds', { guilds: g }, 600 * 1000)
                  .then(() => {
                    this.updateSidebar();
                  });
              });
          }
        });
    }
  }

  /**
   *
   */
  updateSidebar = () => {
    if (!this.guilds) {
      return;
    }

    this.updateGuildsList();
  };

  /**
   *
   */
  updateFilter = () => {
    this.filterInput = createElement('input', {
      'class':       'form-control mb-2 rp-sidebar-guild-filter',
      'placeholder': 'Filter guilds',
      'on':          {
        'keyup': this.handleFilterKeyUp
      }
    });
    this.sidebar.prepend(this.filterInput);
  };

  /**
   *
   */
  updateGuildsList = () => {
    let recommends = this.sidebar.querySelectorAll('.guild-recommendations-list.sidebar-collapsed-hidden');
    if (recommends.length > 1) {
      const mine   = recommends[1];
      const master = recommends[2];

      this.guilds.forEach((guild) => {
        if (
          !mine.querySelector(`a[href="/${guild.name}"]`)
          && !(master && master.querySelector(`a[href="/${guild.name}"]`))
        ) {
          const li = createElement('li', {
            'class': 'guild-recommendations-item',
            'html':  `
              <a href="/${guild.name}">
                <div class="d-flex">
                  <div>
                    <img src="${guild.avatar}" class="profile-pic profile-pic-30 mr-2" alt="Avatar">
                  </div>
                  <div class="my-auto">
                    <div class="text-black font-weight-normal">${guild.name}</div>
                  </div>
                </div>
              </a>
            `
          });
          mine.appendChild(li);
        }
      });
    }

    recommends = this.sidebar.querySelectorAll('.guild-recommendations-list.sidebar-collapsed-visible');
    if (recommends.length > 1) {
      const mine   = recommends[1];
      const master = recommends[2];

      this.guilds.forEach((guild) => {
        if (
          !mine.querySelector(`a[href="/${guild.name}"]`)
          && !(master && master.querySelector(`a[href="/${guild.name}"]`))
        ) {
          const li = createElement('li', {
            'class': 'guild-recommendations-item',
            'html':  `
              <a href="/${guild.name}">
                <img src="${guild.avatar}" class="profile-pic profile-pic-30 transition-square" alt="Avatar">
              </a>
            `
          });
          mine.appendChild(li);
        }
      });
    }
  };

  /**
   *
   */
  handleFilterKeyUp = () => {
    let recommends;
    if (this.sidebar.classList.contains('sidebar-collapsed')) {
      recommends = this.sidebar.querySelectorAll('.guild-recommendations-list.sidebar-collapsed-visible');
    } else {
      recommends = this.sidebar.querySelectorAll('.guild-recommendations-list.sidebar-collapsed-hidden');
    }

    const toggle = document.querySelector('.collapsed-toggle-parent');
    if (recommends.length > 1) {
      const mine  = recommends[1];
      const value = this.filterInput.value.toLowerCase();

      if (value === '') {
        toggle.classList.remove('rp-hidden');
        recommends[0].classList.remove('rp-hidden');
        querySelectorEach(mine, '.guild-recommendations-item', (item) => {
          item.classList.remove('rp-hidden');
        });
      } else {
        toggle.classList.add('rp-hidden');
        recommends[0].classList.add('rp-hidden');
        querySelectorEach(mine, '.guild-recommendations-item', (item) => {
          if (item.querySelector('a').getAttribute('href').toLowerCase().indexOf(value) === -1) {
            item.classList.add('rp-hidden');
          } else {
            item.classList.remove('rp-hidden');
          }
        });
      }
    }
  };
}

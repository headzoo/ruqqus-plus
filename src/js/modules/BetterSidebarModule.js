import Module from './Module';
import { fetchMyGuilds } from '../utils/ruqqus';
import { createElement } from '../utils/web';

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
   * Returns 1 or 0
   *
   * @returns {number}
   */
  static getDefaultSetting = () => {
    return 0;
  };

  /**
   * @returns {string}
   */
  getLabel = () => {
    return 'Enhanced the ruqqus sidebar';
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
      // Add filter now to reduce flicker caused by delay in fetching guilds
      this.updateFilter();

      // Guilds are cached for 10 minutes.
      chrome.storage.sync.get(['guilds'], (resp) => {
        if (resp.guilds) {
          const { items, time } = resp.guilds;
          const diff = ((new Date()).getTime() - time) / 1000;
          if (diff < 600) {
            this.guilds = items;
            this.updateSidebar();
            return;
          }
        }

        fetchMyGuilds()
          .then((guilds) => {
            this.guilds = guilds;
            chrome.storage.sync.set({
              guilds: {
                items: guilds,
                time:  (new Date()).getTime()
              }
            });
            this.updateSidebar();
          });
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
        mine.querySelectorAll('.guild-recommendations-item').forEach((item) => {
          item.classList.remove('rp-hidden');
        });
      } else {
        toggle.classList.add('rp-hidden');
        recommends[0].classList.add('rp-hidden');
        mine.querySelectorAll('.guild-recommendations-item').forEach((item) => {
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

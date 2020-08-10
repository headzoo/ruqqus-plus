import Module from './Module';
import { fetchMyGuilds, extractGuildName } from '../utils/ruqqus';
import { createElement, insertAfter, querySelectorEach } from '../utils/web';
import { searchByObjectKey } from '../utils/arrays';
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
   * @type {{}}
   */
  views = {};

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
  static isEnabledByDefault = () => {
    return false;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'Better Sidebar';
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
    this.onDOMReady(() => {
      this.sidebar = document.querySelector('.sidebar-left');
      if (this.sidebar) {
        this.removeSidebarGuilds();
        this.addFilterInput();

        storage.get('BetterSidebarModule.views', {})
          .then((views) => {
            this.views = views;

            // Guilds are cached in storage for 10 minutes.
            storage.get('BetterSidebarModule.guilds')
              .then((guilds) => {
                if (guilds) {
                  this.guilds = this.sortGuilds(guilds);
                  this.updateSidebar();
                } else {
                  fetchMyGuilds()
                    .then((g) => {
                      this.guilds = this.sortGuilds(g);
                      this.updateSidebar();
                      storage.set('BetterSidebarModule.guilds', this.guilds, 600 * 1000);
                    });
                }
              });
          });
      }
    });
  };

  /**
   *
   */
  removeSidebarGuilds = () => {
    let recommends = this.sidebar.querySelectorAll('.guild-recommendations-list.sidebar-collapsed-hidden');
    if (recommends.length > 1) {
      recommends[1].querySelectorAll('*').forEach((n) => n.remove());
    }
    recommends = this.sidebar.querySelectorAll('.guild-recommendations-list.sidebar-collapsed-visible');
    if (recommends.length > 1) {
      recommends[1].querySelectorAll('*').forEach((n) => n.remove());
    }
  };

  /**
   * @param {[]} guilds
   * @returns {[]}
   */
  sortGuilds = (guilds) => {
    const keys = Object.keys(this.views).sort((a, b) => {
      return this.views[a] > this.views[b] ? -1 : 1;
    });

    const newGuilds = [];
    keys.forEach((key) => {
      const index = searchByObjectKey(guilds, 'name', key);
      if (index !== -1) {
        newGuilds.push(guilds[index]);
      }
    });
    guilds.forEach((guild) => {
      if (keys.indexOf(guild.name) === -1) {
        newGuilds.push(guild);
      }
    });

    return newGuilds;
  }

  /**
   *
   */
  updateSidebar = () => {
    if (!this.guilds) {
      return;
    }

    this.updateGuildsList();

    // Keeping track of how many times a guild has been viewed.
    const guildName = extractGuildName(document.location.pathname);
    if (guildName) {
      for (let i = 0; i < this.guilds.length; i++) {
        if (this.guilds[i].name === guildName) {
          this.recordGuildView(guildName);
          break;
        }
      }
    }
  };

  /**
   *
   */
  addFilterInput = () => {
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
    storage.get('BetterSidebarModule.favorites', [])
      .then((favorites) => {
        if (favorites.length > 0) {
          this.addFavoritesList(favorites);
        }

        const recommends = this.sidebar.querySelectorAll(
          '.guild-recommendations-list.sidebar-collapsed-hidden:not(.rp-better-sidebar-list)'
        );
        if (recommends.length > 1) {
          const mine   = recommends[1];
          const master = recommends[2];
          this.guilds.forEach((guild) => {
            if (!(master && master.querySelector(`a[href="/+${guild.name}"]`))) {
              const li = this.createBigListItem(guild, favorites);
              mine.appendChild(li);
            }
          });
        }
      });

    const recommends = this.sidebar.querySelectorAll(
      '.guild-recommendations-list.sidebar-collapsed-visible:not(.rp-better-sidebar-list)'
    );
    if (recommends.length > 1) {
      const mine   = recommends[1];
      const master = recommends[2];

      this.guilds.forEach((guild) => {
        if (!(master && master.querySelector(`a[href="/+${guild.name}"]`))) {
          const li = this.createSmallListItem(guild);
          mine.appendChild(li);
        }
      });
    }
  };

  /**
   * @param {[]} favorites
   */
  addFavoritesList = (favorites) => {
    const recommends = this.sidebar.querySelectorAll(
      '.guild-recommendations-list.sidebar-collapsed-hidden:not(.rp-better-sidebar-list)'
    );
    if (recommends) {
      const div = recommends[0].closest('div');

      let section;
      const existing = document.querySelector('.rp-better-sidebar-favorites');
      if (existing) {
        section = existing;
        section.querySelectorAll('.guild-recommendations-list').forEach((el) => {
          el.remove();
        });
      } else {
        section = createElement('div', {
          'class': 'mb-4 rp-better-sidebar-favorites',
          'html':  `
            <div class="sidebar-collapsed-hidden">
              <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="text-small font-weight-bold text-muted text-uppercase" style="letter-spacing: 0.025rem;">
                      Favorite Guilds
                  </div>
              </div>
            </div>
            <div class="sidebar-collapsed-visible">
                <i class="fas fa-star text-muted mb-3" style="font-size: 1rem;"></i>
            </div>
        `
        });
        insertAfter(div, section);
      }

      const ulHidden = createElement('ul', {
        'class': 'no-bullets guild-recommendations-list pl-0 sidebar-collapsed-hidden rp-better-sidebar-list'
      });
      const ulVisible = createElement('ul', {
        'class': 'no-bullets guild-recommendations-list pl-0 sidebar-collapsed-visible rp-better-sidebar-list'
      });
      favorites.forEach((guildName) => {
        const index = searchByObjectKey(this.guilds, 'name', guildName);
        if (index !== -1) {
          const guild = this.guilds[index];
          ulHidden.appendChild(this.createBigListItem(guild, favorites));
          ulVisible.appendChild(this.createSmallListItem(guild));
        }
      });

      // Hack. There's some js in ruqqus that's messing with the sidebar if this ul is
      // added right away.
      setTimeout(() => {
        section.appendChild(ulHidden);
        section.appendChild(ulVisible);
      }, 0);
    }
  };

  /**
   * @param {*} guild
   * @param {[]} favorites
   * @returns {HTMLElement}
   */
  createBigListItem = (guild, favorites) => {
    const li = createElement('li', {
      'class': 'guild-recommendations-item rp-better-sidebar-item'
    });
    const link = createElement('a', {
      'href': `/+${guild.name}`
    });
    li.appendChild(link);

    const div = createElement('div', {
      'class': 'd-flex align-items-center',
      'html':  `
        <div>
          <img src="${guild.avatar}" class="profile-pic profile-pic-30 mr-2" alt="Avatar">
        </div>
        <div class="rp-better-sidebar-ellipsis mr-2">
          <div class="text-black font-weight-normal">
              +${guild.name}
          </div>
        </div>
      `
    });
    link.appendChild(div);

    const isFavorited = favorites.indexOf(guild.name) !== -1;
    const star = createElement('i', {
      'class':            'fas fa-star rp-better-sidebar-star ml-auto',
      'title':            isFavorited ? 'Unfavorite' : 'Favorite',
      'data-rp-bs-guild': guild.name,
      'on':               {
        'click': this.handleFavoriteClick
      }
    });
    if (isFavorited) {
      star.classList.add('rp-better-sidebar-favorited');
    }
    div.appendChild(star);

    return li;
  };

  /**
   * @param {*} guild
   * @returns {HTMLElement}
   */
  createSmallListItem = (guild) => {
    return createElement('li', {
      'class': 'guild-recommendations-item',
      'html':  `
        <a href="/+${guild.name}">
          <img src="${guild.avatar}" class="profile-pic profile-pic-30 transition-square" alt="Avatar">
        </a>
      `
    });
  };

  /**
   *
   */
  handleFilterKeyUp = () => {
    let recommends;
    let favorites;
    if (this.sidebar.classList.contains('sidebar-collapsed')) {
      recommends = this.sidebar.querySelectorAll(
        '.guild-recommendations-list.sidebar-collapsed-visible:not(.rp-better-sidebar-list)'
      );
      favorites  = this.sidebar.querySelector('.rp-better-sidebar-favorites');
    } else {
      recommends = this.sidebar.querySelectorAll(
        '.guild-recommendations-list.sidebar-collapsed-hidden:not(.rp-better-sidebar-list)'
      );
      favorites  = this.sidebar.querySelector('.rp-better-sidebar-favorites');
    }

    const toggle = document.querySelector('.collapsed-toggle-parent');
    if (recommends.length > 1) {
      const mine  = recommends[1];
      const value = this.filterInput.value.toLowerCase();

      if (value === '') {
        toggle.classList.remove('rp-hidden');
        recommends[0].classList.remove('rp-hidden');
        if (favorites) {
          favorites.classList.remove('rp-hidden');
        }
        querySelectorEach(mine, '.guild-recommendations-item', (item) => {
          item.classList.remove('rp-hidden');
        });
      } else {
        toggle.classList.add('rp-hidden');
        recommends[0].classList.add('rp-hidden');
        if (favorites) {
          favorites.classList.add('rp-hidden');
        }
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

  /**
   * @param {Event} e
   */
  handleFavoriteClick = (e) => {
    const { target } = e;
    e.preventDefault();

    storage.get('BetterSidebarModule.favorites', [])
      .then((favorites) => {
        const guildName = target.getAttribute('data-rp-bs-guild');
        if (guildName) {
          const index = favorites.indexOf(guildName);
          if (index === -1) {
            favorites.push(guildName);
            document.querySelectorAll(
              `.guild-recommendations-item a[href="/+${guildName}"] .rp-better-sidebar-star`
            ).forEach((star) => {
              star.classList.add('rp-better-sidebar-favorited');
            });
          } else {
            favorites.splice(index, 1);
            document.querySelectorAll(
              `.guild-recommendations-item a[href="/+${guildName}"] .rp-better-sidebar-star`
            ).forEach((star) => {
              star.classList.remove('rp-better-sidebar-favorited');
            });
          }

          storage.set('BetterSidebarModule.favorites', favorites)
            .then(() => {
              this.addFavoritesList(favorites);
            });
        }
      });
  };

  /**
   * @param {string} guildName
   */
  recordGuildView = (guildName) => {
    if (!this.views[guildName]) {
      this.views[guildName] = 0;
    }
    this.views[guildName] += 1;
    storage.set('BetterSidebarModule.views', this.views);
  };
}

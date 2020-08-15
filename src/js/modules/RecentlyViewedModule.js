import Module from './Module';
import { searchByObjectKey } from '../utils/arrays';
import { truncateString } from '../utils/strings';
import storage from '../utils/storage';

/**
 * Displays recently viewed posts in the right sidebar
 */
export default class RecentlyViewedModule extends Module {
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
    return 'Recently Viewed';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Displays recently viewed posts in the right sidebar.';
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    this.listen('rp.PopupPostsModule.events', ({ detail }) => {
      if (detail.url) {
        this.recordView(detail.url, detail.title, detail.thumb);
      }
    });

    this.onDOMReady(() => {
      this.addSidebar();
      if (document.location.pathname.indexOf('/post') === 0) {
        const thumb = document.querySelector('.post-img');
        this.recordView(document.location.pathname, document.title, thumb ? thumb.getAttribute('src') : '');
      }
    });
  };

  /**
   *
   */
  addSidebar = () => {
    const sidebar = document.querySelector('.sidebar:not(.sidebar-left)');
    if (sidebar) {
      storage.get('RecentlyViewedModule.history', [])
        .then((history) => {
          const section = this.html.createElement('div', {
            'class': 'sidebar-section rp-recently-viewed-sidebar',
            'html':  `
                <div class="title">
                  <i class="fas fa-history mr-2"></i>Recently Viewed
                </div>
              `
          });
          const body = this.html.createElement('div', {
            'class': 'body'
          });
          section.appendChild(body);
          const ul = this.html.createElement('ul', {
            'class': 'rp-recently-viewed-list'
          });
          history.forEach((item) => {
            const li = this.html.createElement('li', {
              'class': 'mb-2',
              'html':  `
                    <h5 class="card-title post-title text-left">
                        <a href="${item.url}">
                            <img
                                src="${item.thumb || '/assets/images/icons/default_thumb_text.png'}"
                                class="post-img mr-2"
                                alt="Thumbnail"
                            />
                        </a>
                        <a href="${item.url}">
                            ${truncateString(item.title, 60)}
                        </a>
                    </h5>`
            });
            ul.appendChild(li);
          });
          body.appendChild(ul);
          const clear = this.html.createElement('div', {
            'class': 'btn btn-sm btn-secondary mr-1',
            'title': 'Clear history',
            'text':  'Clear',
            'on':    {
              'click': this.handleClearClick
            }
          });
          body.appendChild(clear);
          const settings = this.html.createElement('div', {
            'class': 'btn btn-sm btn-secondary',
            'title': 'Settings',
            'html':  `
              <i class="fas fa-cog"></i>
            `,
            'on': {
              'click': this.handleSettingsClick
            }
          });
          body.appendChild(settings);

          const sections = sidebar.querySelectorAll('.sidebar-section');
          this.html.insertAfter(sections[sections.length - 1], section);
        });
    }
  };

  /**
   *
   */
  handleClearClick = () => {
    storage.remove('RecentlyViewedModule.history')
      .then(() => {
        const section = document.querySelector('.rp-recently-viewed-sidebar');
        if (section) {
          section.remove();
          this.addSidebar();
        }
      });
  };

  /**
   *
   */
  handleSettingsClick = () => {
    storage.get('RecentlyViewedModule.settings', { max: 5 })
      .then((settings) => {
        // eslint-disable-next-line no-alert
        const input = window.prompt('Number of posts to keep in history. (1 min, 20 max)', settings.max);
        if (input) {
          settings.max = parseInt(input, 10) || 1;
          if (settings.max < 1) {
            settings.max = 1;
          } else if (settings.max > 20) {
            settings.max = 20;
          }
          storage.set('RecentlyViewedModule.settings', settings)
            .then(() => {
              this.toastSuccess('Settings saved!');
            });
        }
      });
  };

  /**
   * @param {string} url
   * @param {string} title
   * @param {string} thumb
   */
  recordView = (url, title, thumb) => {
    storage.get('RecentlyViewedModule.settings', { max: 8 })
      .then((settings) => {
        storage.get('RecentlyViewedModule.history', [])
          .then((history) => {
            if (searchByObjectKey(history, 'url', url) === -1) {
              history.unshift({
                thumb,
                title,
                url
              });
              history.splice(settings.max);
              storage.set('RecentlyViewedModule.history', history);
            }
          });
      });
  };
}

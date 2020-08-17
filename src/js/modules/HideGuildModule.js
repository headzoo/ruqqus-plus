import Module from './Module';

/**
 * Adds a hide guild button to posts
 */
export default class HideGuildModule extends Module {
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
    return 'Hide Guilds';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Makes it easier to hide guilds by adding a hide guild button to posts.';
  };

  /**
   * Called from the script injected into the page
   *
   * Code from here has access to the ruqqus `window` object but not the
   * chrome extension API.
   */
  execWindowContext = () => {
    this.listen('rp.blockGuild', (data) => {
      const { guild } = data.detail;

      const formkey = window.formkey();
      if (!formkey) {
        this.toastError('Error, unable to block user.');
        return;
      }

      const formData = new FormData();
      formData.append('board', guild.replace('+', ''));
      formData.append('formkey', formkey);

      fetch('https://ruqqus.com/settings/block_guild', {
        body:   formData,
        method: 'post'
      })
        .then((resp) => resp.text())
        .then((text) => {
          console.log(text);
        });
    });
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
   */
  execContentContext = () => {
    const exec = () => {
      const posts = document.querySelector('.posts');
      if (posts) {
        this.html.querySelectorEach(posts, '.card', this.wireupCard);
      }
    };

    this.onDOMReady(() => {
      this.listen('rp.change', exec);
      exec();
    });
  }

  /**
   * @param {Element} card
   */
  wireupCard = (card) => {
    if (card && card.querySelector('a[data-rp-blocked-guild-id]')) {
      return;
    }

    const item    = this.createBlockLink(card);
    const actions = card.querySelector('.post-actions ul');
    actions.appendChild(item);
  };

  /**
   * @param {Element} card
   * @returns {Element}
   */
  createBlockLink = (card) => {
    const id   = card.getAttribute('id').replace('post-', '');
    const item = this.html.createElement('li', {
      'class': 'list-inline-item'
    });
    const anchor = this.html.createElement('a', {
      'href':                     'javascript:void(0)', // eslint-disable-line
      'title':                    'Hide guild',
      'html':                     '<i class="fas fa-ban"></i> Hide Guild',
      'data-rp-blocked-guild-id': id,
      'on':                       {
        click: this.handleBlockClick
      }
    });
    item.appendChild(anchor);

    return item;
  };

  /**
   * @param {Event} e
   */
  handleBlockClick = (e) => {
    e.preventDefault();

    const { currentTarget } = e;
    const id   = currentTarget.getAttribute('data-rp-blocked-guild-id');
    const card = document.getElementById(`post-${id}`);
    if (!card) {
      return;
    }

    const guild = card.querySelector('.post-meta-guild a').getAttribute('href').replace('/', '');
    // eslint-disable-next-line no-alert
    if (window.confirm(`Are you sure you want to block ${guild}?`)) {
      // Block needs to happen from the window context in order to access
      // the window.formkey() function. The window context is listening for
      // this event.
      this.dispatch('rp.blockGuild', { guild });
      this.removeUserCards(guild);
      this.toastSuccess(`${guild} hidden.`);
    }
  };

  /**
   * @param {string} guild
   */
  removeUserCards = (guild) => {
    this.html.querySelectorEach('.posts .card', (card) => {
      if (card.querySelector('.post-meta-guild a').getAttribute('href').replace('/', '') === guild) {
        card.remove();
      }
    });
  }
}

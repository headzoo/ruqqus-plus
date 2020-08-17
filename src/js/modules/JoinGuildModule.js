import Module from './Module';

/**
 * Adds a join guild button to each post
 */
export default class JoinGuildModule extends Module {
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
    return 'Join Guilds';
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return 'Adds a join guild button to each post.';
  };

  /**
   * Called from the script injected into the page
   *
   * Code from here has access to the ruqqus `window` object but not the
   * chrome extension API.
   */
  execWindowContext = () => {
    this.listen('rp.joinGuild', (data) => {
      const { guild, path } = data.detail;

      const formkey = window.formkey();
      if (!formkey) {
        this.toastError('Error, unable to join guild.');
        return;
      }

      const formData = new FormData();
      formData.append('formkey', formkey);

      fetch(`https://ruqqus.com/api/${path}/${guild}`, {
        body:   formData,
        method: 'post'
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
    this.listen('rp.change', this.wireupCards);

    this.onDOMReady(this.wireupCards);
  };

  /**
   *
   */
  wireupCards = () => {
    this.html.querySelectorEach('.posts .card', (card) => {
      const anchors = card.querySelectorAll('.post-meta-guild a:not(.rp-join-guild-watched)');
      if (anchors) {
        anchors.forEach((a) => {
          const icon = this.html.createElement('i', {
            'title':              'Join guild',
            'class':              'fas fa-plus-square rp-pointer ml-2',
            'data-rp-join-guild': a.getAttribute('href').replace('/+', ''),
            'on':                 {
              'click': this.handleJoinClick
            }
          });
          a.classList.add('rp-join-guild-watched');
          if (a.classList.contains('text-black')) {
            this.html.insertAfter(a.closest('span'), icon);
          } else {
            // @todo mobile
          }
        });
      }
    });
  };

  /**
   * @param {Event} e
   */
  handleJoinClick = (e) => {
    e.preventDefault();

    const { currentTarget } = e;
    const guild = currentTarget.getAttribute('data-rp-join-guild');
    this.dispatch('rp.joinGuild', { guild, path: 'subscribe' });
    currentTarget.classList.remove('fa-plus-square');
    currentTarget.classList.add('fa-minus-square');
    currentTarget.setAttribute('title', 'Leave guild');
  };
}

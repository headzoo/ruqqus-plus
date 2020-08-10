import React from 'react';
import ReactDOM from 'react-dom';
import Module from './Module';
import Sidebar from './BetterSidebarModule/Sidebar';
import { extractGuildName } from '../utils/ruqqus';
import storage from '../utils/storage';

/**
 * Enhanced the ruqqus sidebar
 */
export default class BetterSidebarModule extends Module {
  /**
   * @type {boolean}
   */
  sidebarMounted = false;

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
    // Not using this.onDOMReady to avoid flicker when we remove the default
    // sidebar.
    this.changeSidebar();

    // But sometimes the above doesn't work because the default sidebar hasn't rendered
    // yet. This is our backup plan.
    this.onDOMReady(() => {
      if (!this.sidebarMounted) {
        this.changeSidebar();
      }
    });

    // Keeping track of how many times a guild has been viewed.
    const guildName = extractGuildName(document.location.pathname);
    if (guildName) {
      this.handleGuildView(guildName);
    }
  };

  /**
   *
   */
  changeSidebar = () => {
    const sidebar = document.querySelector('.sidebar-left');
    if (sidebar) {
      const mount = document.createElement('div');
      sidebar.parentNode.replaceChild(mount, sidebar);

      ReactDOM.render(
        // eslint-disable-next-line react/jsx-filename-extension
        <Sidebar />,
        mount
      );
      this.sidebarMounted = true;
    }
  };

  /**
   * @param {string} guildName
   */
  handleGuildView = (guildName) => {
    storage.get('BetterSidebarModule.views', {})
      .then((views) => {
        if (!views[guildName]) {
          views[guildName] = 0;
        }
        views[guildName] += 1;
        storage.set('BetterSidebarModule.views', views);
      });
  };
}

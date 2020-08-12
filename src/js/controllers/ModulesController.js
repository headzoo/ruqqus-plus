import storage from '../utils/storage';
import mods from '../modules';
import Controller from './Controller';
import Settings from './ModulesController/Settings';

/**
 * Action that handles modules
 */
export default class ModulesController extends Controller {
  /**
   * @type {{}}
   */
  activeModules = {};

  /**
   * @returns {string}
   */
  getSettingsSidebarLabel = () => {
    return 'Modules';
  };

  /**
   * @returns {*}
   */
  getSettingsComponent = () => {
    return Settings;
  };

  /**
   * Called when the extension is installed
   */
  onInstalled = () => {
    storage.get('modules', {})
      .then((active) => {
        const newModules = {};
        Object.keys(mods).forEach((key) => {
          if (!active[key]) {
            newModules[key] = mods[key].isEnabledByDefault();
          } else {
            newModules[key] = active[key];
          }
        });

        storage.set('modules', newModules)
          .then(() => {
            Object.keys(mods).forEach((key) => {
              const mod = new mods[key]();
              mod.onInstalled();
            });
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
    // When the window context is ready we send the list of
    // active modules.
    this.listen('rp.ModulesAction.windowContextReady', () => {
      this.dispatch('rp.ModulesAction.modulesReady', {
        activeModules: Object.keys(this.activeModules)
      });
    });

    this.getModules()
      .then((modules) => {
        this.activeModules = {};
        Object.keys(modules).forEach((key) => {
          if (modules[key] && mods[key]) {
            const mod = new mods[key]();
            mod.execContentContext();
            this.activeModules[key] = mod;
          }
        });
      });
  };

  /**
   * Called from the script injected into the page
   *
   * Code run from here has access to the ruqqus `window` object but not the
   * chrome extension API.
   */
  execWindowContext = () => {
    this.listen('rp.ModulesAction.modulesReady', (e) => {
      const { activeModules } = e.detail;

      const loadedModules = {};
      activeModules.forEach((key) => {
        const module = new mods[key]();
        module.execWindowContext();
        loadedModules[key] = module;
      });
    });
    this.dispatch('rp.ModulesAction.windowContextReady');
  };

  /**
   * Called from the background script
   */
  execBackgroundContext = () => {
    this.getModules()
      .then((modules) => {
        Object.keys(modules).forEach((key) => {
          if (modules[key] && mods[key]) {
            const mod = new mods[key]();
            mod.execBackgroundContext();
          }
        });
      });
  };

  /**
   * @returns {Promise}
   */
  getModules = () => {
    return storage.get('modules', {})
      .then((modules) => {
        // Find modules which have been recently added but not found in
        // the settings.
        let isChanged = false;
        Object.keys(mods).forEach((key) => {
          if (modules[key] === undefined) {
            modules[key] = mods[key].isEnabledByDefault();
            isChanged = true;
          }
        });
        if (isChanged) {
          storage.set('modules', modules);
        }

        return modules;
      });
  };
}

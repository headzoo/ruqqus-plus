import React, { useEffect, useState } from 'react';
import storage from '../utils/storage';
import mods from '../modules';
import Action from './Action';

/**
 * Action that handles modules
 */
export default class ModulesAction extends Action {
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
    return () => {
      const [loaded, setLoaded]   = useState({});
      const [modules, setModules] = useState({});

      useEffect(() => {
        storage.get('modules')
          .then((active) => {
            Object.keys(mods).forEach((key) => {
              if (active[key] === undefined) {
                active[key] = mods[key].getDefaultSetting();
              }
            });
            setModules(active);

            const newLoaded = {};
            Object.keys(modules).forEach((key) => {
              if (mods[key]) {
                newLoaded[key] = new mods[key]();
              }
            });
            setLoaded(newLoaded);
          });
      }, [modules]);

      /**
       * @param {*} e
       */
      const handleCheckChange = (e) => {
        const newModules = { ...modules };
        newModules[e.target.name] = e.target.checked;
        storage.set('modules', newModules)
          .then(() => {
            setModules(newModules);
          });
      };

      return (
        <form className="pt-2">
          <div className="mb-4">
            <h3 className="mb-3">
              Modules
            </h3>
            {Object.keys(loaded).map((key) => (
              <div key={key} className="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  name={key}
                  id={`setting-${key}`}
                  className="custom-control-input"
                  checked={!!modules[key]}
                  onChange={handleCheckChange}
                />
                <label className="custom-control-label" htmlFor={`setting-${key}`}>
                  {loaded[key].getLabel()}
                </label>
                <div className="text-muted">{loaded[key].getHelp()}</div>
              </div>
            ))}
          </div>
        </form>
      );
    };
  };

  /**
   * Called when the extension is installed
   */
  onInstalled = () => {
    storage.get('modules')
      .then((active) => {
        const newModules = {};
        Object.keys(mods).forEach((key) => {
          if (!active[key]) {
            newModules[key] = mods[key].getDefaultSetting();
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

    storage.get('modules')
      .then((modules) => {
        // Find modules which have been recently added but not found in
        // the settings.
        let isChanged = false;
        Object.keys(mods).forEach((key) => {
          if (modules[key] === undefined) {
            modules[key] = mods[key].getDefaultSetting();
            isChanged = true;
          }
        });
        if (isChanged) {
          storage.set('modules', modules);
        }

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
}

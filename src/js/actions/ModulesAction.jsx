import React, { useEffect, useState } from 'react';
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
        chrome.storage.sync.get('modules', (value) => {
          setModules(value.modules);

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
        chrome.storage.sync.set({ modules: newModules }, () => {
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
    chrome.storage.sync.get('modules', (values) => {
      const modules = values.modules || {};

      const newModules = {};
      Object.keys(mods).forEach((key) => {
        if (!modules[key]) {
          newModules[key] = mods[key].getDefaultSetting();
        } else {
          newModules[key] = modules[key];
        }
      });

      chrome.storage.sync.set({ modules: newModules }, () => {
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

    chrome.storage.sync.get('modules', (value) => {
      const { modules } = value;

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

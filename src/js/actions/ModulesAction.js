import toastr from 'toastr';
import forms from '../utils/forms';
import { createTemplateContent } from '../utils/web';
import mods from '../modules';
import Action from './Action';
import * as constants from '../constants';

/**
 * Action that handles modules
 */
export default class ModulesAction extends Action {
  /**
   * @returns {string}
   */
  getLabel = () => {
    return 'Modules';
  };

  /**
   * @returns {string}
   */
  getSettingsHtml = () => {
    return `
      <form id="form-modules" class="pt-2">
          <div class="mb-4">
              <h3 class="mb-3">
                  Modules
              </h3>
              <!-- Module settings are mounted here -->
              <div id="mount-modules"></div>
          </div>
          <button type="submit" class="btn btn-primary">
              Save
          </button>
      </form>
    `;
  };

  /**
   *
   */
  onSettingsPageReady = () => {
    /** @type {HTMLFormElement} */
    const form         = document.getElementById('form-modules');
    const modulesMount = document.getElementById('mount-modules');
    const loaded       = {};

    const settingOnOffTemplate = `
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          name="%%name%%"
          class="custom-control-input"
          id="setting-%%name%%"
        />
        <label class="custom-control-label" for="setting-%%name%%">
          %%label%%
        </label>
      </div>`;

    chrome.storage.sync.get('modules', (value) => {
      const { modules } = value;

      // Adds module settings to the form.
      Object.keys(modules).forEach((key) => {
        const mod   = new mods[key]();
        const label = mod.getLabel();
        loaded[key] = mod;

        const html    = settingOnOffTemplate.replace(/%%name%%/g, key).replace(/%%label%%/g, label);
        const content = createTemplateContent(html);
        modulesMount.appendChild(content);
      });

      forms.deserialize(form, modules);
    });

    // Saves the settings.
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const modules = forms.serialize(form);
      chrome.storage.sync.set({ modules });
      toastr.success('Settings have been saved.', '', {
        closeButton:   true,
        positionClass: 'toast-bottom-center'
      });
    });
  }

  /**
   * Called when the extension is installed
   */
  onInstalled = () => {
    const modules = {
      [constants.MOD_INFINITE_SCROLL]: 1,
      [constants.MOD_POSTS_NEW_TAB]:   0,
      [constants.MOD_BIGGER_BUTTONS]:  0
    };

    chrome.storage.sync.set({ modules }, () => {
      Object.keys(mods).forEach((key) => {
        const mod = new mods[key]();
        mod.onInstalled();
      });
    });
  };

  /**
   * Called from the content script
   */
  execContentContext = () => {
    chrome.storage.sync.get('modules', (value) => {
      const { modules } = value;

      const actionModules = {};
      Object.keys(modules).forEach((key) => {
        const mod = new mods[key]();
        mod.execContentContext();
        actionModules[key] = mod;
      });

      // Let the contentInject.js script know which modules are active.
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('rp.modulesReady', {
          'detail': {
            activeModules: Object.keys(actionModules)
          }
        }));
      }, 2000);
    });
  };

  /**
   * Called from the script injected into the page
   */
  execWindowContext = () => {
    document.addEventListener('rp.modulesReady', (e) => {
      const { activeModules } = e.detail;

      const loadedModules = {};
      activeModules.forEach((key) => {
        const module = new mods[key]();
        module.execWindowContext();
        loadedModules[key] = module;
      });
    });
  };
}

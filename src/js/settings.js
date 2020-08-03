import toastr from 'toastr';
import forms from './utils/forms';
import { createTemplateContent } from './utils/web';
import modules from './modules';

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

window.addEventListener('DOMContentLoaded', () => {
  /** @type {HTMLFormElement} */
  const form         = document.getElementById('settings-form');
  const modulesMount = document.getElementById('module-settings-mount');
  const loaded       = {};

  chrome.storage.sync.get('settings', (value) => {
    const { settings } = value;

    // Adds module settings to the form.
    Object.keys(settings).forEach((key) => {
      const mod   = new modules[key]();
      const label = mod.getLabel();
      loaded[key] = mod;

      const html    = settingOnOffTemplate.replace(/%%name%%/g, key).replace(/%%label%%/g, label);
      const content = createTemplateContent(html);
      modulesMount.appendChild(content);
    });

    forms.deserialize(form, settings);
  });

  // Saves the settings.
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const settings = forms.serialize(form);
    Object.keys(loaded).forEach((key) => {
      if (settings[key]) {
        loaded[key].saveSettings(settings);
      }
    });

    chrome.storage.sync.set({ settings });
    toastr.success('Settings have been saved.', '', {
      closeButton:   true,
      positionClass: 'toast-bottom-center'
    });
  });
});

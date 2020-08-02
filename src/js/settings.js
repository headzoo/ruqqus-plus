import toastr from 'toastr';
import forms from './utils/forms';
import { createTemplateContent } from './utils/web';
import modules from './modules';

window.addEventListener('DOMContentLoaded', () => {
  /** @type {HTMLFormElement} */
  const form         = document.getElementById('settings-form');
  const modulesMount = document.getElementById('module-settings-mount');
  const loaded       = {};

  chrome.storage.sync.get('settings', (value) => {
    const { settings } = value;

    // Adds module settings to the form.
    Object.keys(settings).forEach((key) => {
      const mod  = new modules[key]();
      const html = mod.getSettings();
      if (html) {
        const content = createTemplateContent(html);
        modulesMount.appendChild(content);
      }
      loaded[key] = mod;
    });

    forms.deserialize(form, settings);
  });

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

import toastr from 'toastr';
import forms from './utils/forms';
import { createTemplateContent } from './utils/web';
import modules from './modules';

window.addEventListener('DOMContentLoaded', () => {
    /** @type {HTMLFormElement} */
    const form         = document.getElementById('settings-form');
    const modulesMount = document.getElementById('module-settings-mount');

    // Adds module settings to the form.
    Object.keys(modules).forEach((key) => {
        const html = modules[key].getSettings();
        if (html) {
            const content = createTemplateContent(html);
            modulesMount.appendChild(content);
        }
    });

    chrome.storage.sync.get('settings', (value) => {
        forms.deserialize(form, value.settings);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const settings = forms.serialize(form);
        chrome.storage.sync.set({ settings });
        toastr.success('Settings have been saved.', '', {
            closeButton:   true,
            positionClass: 'toast-bottom-center'
        });
    });
});

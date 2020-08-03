import toastr from 'toastr';
import forms from '../utils/forms';
import Action from './Action';

/**
 * Adds custom css and javascript to each ruqqus page.
 */
export default class HeadAction extends Action {
  /**
   * @returns {string}
   */
  getLabel = () => {
    return 'CSS/JS';
  };

  /**
   * @returns {string}
   */
  getSettingsHtml = () => {
    return `
      <form id="form-css" class="pt-2">
          <div class="mb-4">
              <h3 class="mb-3">
                  CSS/JS
              </h3>
              <div class="form-group">
                <label for="form-css-css">CSS</label>
                <textarea name="css" class="form-control" id="form-css-css" rows="6" aria-describedby="form-css-css-help"></textarea>
                <small id="form-css-css-help" class="form-text text-muted">
                  CSS added to every page of the site.
                </small>
              </div>
              <div class="form-group">
                <label for="form-css-js">Javascript</label>
                <textarea name="js" class="form-control" id="form-css-js" rows="6" aria-describedby="form-css-js-help"></textarea>
                <small id="form-css-js-help" class="form-text text-muted">
                  Javascript added to every page of the site.
                </small>
              </div>
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
    const form = document.getElementById('form-css');

    chrome.storage.sync.get('head', (value) => {
      forms.deserialize(form, value.head || {});
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const head = forms.serialize(form);
      chrome.storage.sync.set({ head }, () => {
        toastr.success('Settings have been saved.', '', {
          closeButton:   true,
          positionClass: 'toast-bottom-center'
        });
      });
    });
  };

  /**
   * Called from the content script
   */
  execContentContext = () => {
    chrome.storage.sync.get('head', (values) => {
      const { head } = values;

      if (head) {
        const headEl = document.querySelector('head');

        if (head.css) {
          const style = document.createElement('style');
          style.setAttribute('type', 'text/css');
          style.innerHTML = head.css;
          headEl.appendChild(style);
        }

        if (head.js) {
          const script     = document.createElement('script');
          script.innerHTML = head.js;
          headEl.appendChild(script);
        }
      }
    });
  };
}

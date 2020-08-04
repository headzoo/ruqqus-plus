import React, { useState, useEffect } from 'react';
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
   * @returns {*}
   */
  getSettingsComponent = () => {
    const self = this;

    return () => {
      const [css, setCss] = useState('');
      const [js, setJs]   = useState('');

      useEffect(() => {
        chrome.storage.sync.get('head', (value) => {
          if (value.head) {
            setCss(value.head.css || '');
            setJs(value.head.js || '');
          }
        });
      }, []);

      /**
       * @param {*} e
       */
      const handleSaveClick = (e) => {
        e.preventDefault();

        const head = { css, js };
        chrome.storage.sync.set({ head }, () => {
          self.toastSuccess('Settings have been saved.');
        });
      };

      /**
       * @param {*} e
       */
      const handleChange = (e) => {
        if (e.target.name === 'css') {
          setCss(e.target.value);
        } else {
          setJs(e.target.value);
        }
      };

      return (
        <form id="form-css" className="pt-2">
          <div className="mb-4">
            <h3 className="mb-3">
              CSS/JS
            </h3>
            <div className="form-group">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="form-css-css">
                CSS
              </label>
              <textarea
                name="css"
                className="form-control"
                id="form-css-css"
                rows="6"
                aria-describedby="form-css-css-help"
                value={css}
                onChange={handleChange}
              />
              <small id="form-css-css-help" className="form-text text-muted">
                CSS added to every page of the site.
              </small>
            </div>
            <div className="form-group">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="form-css-js">
                Javascript
              </label>
              <textarea
                name="js"
                className="form-control"
                id="form-css-js"
                rows="6"
                aria-describedby="form-css-js-help"
                value={js}
                onChange={handleChange}
              />
              <small id="form-css-js-help" className="form-text text-muted">
                Javascript added to every page of the site.
              </small>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" onClick={handleSaveClick}>
            Save
          </button>
        </form>
      );
    };
  };

  /**
   * Called from the content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object.
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

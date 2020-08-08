import React, { useState, useEffect } from 'react';
import { createElement } from '../utils/web';
import storage from '../utils/storage';
import Controller from './Controller';

/**
 * Adds custom css and javascript to each ruqqus page.
 */
export default class HeadController extends Controller {
  /**
   * @returns {string}
   */
  getSettingsSidebarLabel = () => {
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
        storage.get('head')
          .then((head) => {
            if (head) {
              setCss(head.css || '');
              setJs(head.js || '');
            }
          });
      }, []);

      /**
       * @param {*} e
       */
      const handleSaveClick = (e) => {
        e.preventDefault();

        const head = { css, js };
        storage.set('head', head)
          .then(() => {
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

      /**
       * @param {*} e
       */
      const handleKeyDown = (e) => {
        if (e.keyCode === 9 || e.which === 9) {
          e.preventDefault();
          const { target } = e;
          const s = target.selectionStart;
          target.value = `${target.value.substring(0, target.selectionStart)}\t${target.value.substring(target.selectionEnd)}`;
          target.selectionEnd = s + 1;
        }
      };

      return (
        <form id="form-css" className="pt-2">
          <div className="mb-4">
            <p>
              Inject custom CSS and Javascript into every page on ruqqus.
            </p>
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
                onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
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
    storage.get('head')
      .then((head) => {
        if (head) {
          const headEl = document.querySelector('head');

          if (head.css) {
            const style = createElement('style', {
              'type': 'text/css',
              'html': head.css
            });
            headEl.appendChild(style);
          }

          if (head.js) {
            const script = createElement('script', {
              'html': head.js
            });
            headEl.appendChild(script);
          }
        }
      });
  };
}

Ruqqus Plus
===========
Chrome extension that provides enhancements for ruqqus.com.

https://ruqqus.com/+RuqqusPlus

### Building
Yarn or npm will be needed to build the extension. Run the following commands (replacing `yarn` with `npm` where applicable).

```
git clone git@github.com:headzoo/ruqqus-plus.git
cd ruqqus-plus
yarn install
yarn run build
```

Now the extension should be loaded as an unpacked extension. See [instructions for loading unpacked extensions](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/). The created `/ruqqus-plus/build` directory should be loaded.

### Developing
In order to add additional functionality follow the building steps above. Use the `yarn run watch` command instead of `yarn run build` to automatically compile your changes as you make them. [Extensions Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid) is recommended to quickly reload your changes.

The extension is written in ES6, React, and SCSS.

Most of the functionality is encapsulated within modules which can be found in the `/src/js/modules` directory. Modules as just classes that expose a few methods that the extension calls at different points in the extension lifecycle. A module to add `target="_blank"` to post links might look like this.

```js
import Module from './Module';

/**
 * Opens posts in a new tab.
 */
export default class NewTabModule extends Module {
  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {number}
   */
  static getDefaultSetting = () => {
    return 1;
  };

  /**
   * Returns the label displayed on the extensions settings page next
   * to the checkbox to turn the module on or off.
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'Open posts in new tab';
  };

  /**
   * Called from the extension content script on page load
   */
  execContentContext = () => {
    document.querySelectorAll('.card-title a').forEach((link) => {
      link.setAttribute('target', '_blank');
    });
  };
}
```

Once created the module must be registered by adding it to `/src/js/modules/index.js`.

The following is the full list of module methods the extension will call.

```js
export default class Module {
  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {number}
   */
  static getDefaultSetting = () => {
    return 0;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    return 'Does something';
  }

  /**
   * All modules have on/off checkboxes on the extension settings page, but
   * modules may also have advanced settings which are reachable from the
   * settings page sidebar. This method returns the label used in the sidebar.
   *
   * @returns {string} Return a falsy value when the module does not have settings
   */
  getSettingsSidebarLabel = () => {
    return 'Tagged Users';
  };

  /**
   * Returns the advanced settings form when applicable. The method must return
   * a React component.
   *
   * @returns {*}
   */
  getSettingsComponent = () => {
    const self = this;

    // Returns a React functional component. Alternatively the method
    // can return a component defined somewhere else like
    // return MyComponent;
    return () => {
      const [value, setValue] = useState('');

      useEffect(() => {
        chrome.storage.sync.get('mySettings', (resp) => {
          if (resp.value) {
            setValue(resp.value);
          }
        });
      }, []);

      /**
       * @param {Event} e
       */
      const handleSaveClick = (e) => {
        e.preventDefault();

        const mySettings = { value };
        chrome.storage.sync.set({ mySettings }, () => {
          self.toastSuccess('Settings have been saved.');
        });
      };

      return (
        <form className="pt-2">
          <div className="mb-4">
            <h3 className="mb-3">
              CSS/JS
            </h3>
            <div className="form-group">
              <label htmlFor="form-value">
                Enter a value
              </label>
              <input
                id="form-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
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
   * Called from the extension content script
   *
   * The content script has access to the chrome extension API but does not
   * have access to the ruqqus `window` object. For example you can't access
   * window.upvote() from here.
   *
   * This is usually where your code will go.
   */
  execContentContext = () => {
    chrome.storage.sync.get('mySettings', (resp) => {
      if (resp.value) {
        console.log(resp.value);
      }
    });
  };

  /**
   * Called from the script injected into the page
   *
   * Code from here has access to the ruqqus `window` object but not the
   * chrome extension API.
   */
  execWindowContext = () => {
  };

  /**
   * Called from the background script
   */
  execBackgroundContext = () => {
  }

  /**
   * Called when the extension is installed
   */
  onInstalled = () => {
  }
}
```

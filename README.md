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

Once create the module must be registered by adding it to `/src/js/modules/index.js`.

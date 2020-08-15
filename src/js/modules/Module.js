import Controller from '../controllers/Controller';
import * as html from '../utils/web';

/**
 * Parent module class
 */
export default class Module extends Controller {
  /**
   * @type {{hasParentClass?, setAttributes?: function(HTMLElement, {}): HTMLElement, setHTML?: function(Element, string): Element, injectScript?: function(string): void, createTemplateContent?: function(string): DocumentFragment, querySelectorEach?: function((Element|DocumentFragment|string), (string|Function), Function=): void, injectCSS?: function(string): void, insertBefore?: function(Element, Element): void, insertAfter?: function(Element, Element): void, getSelectionText?: function(): string, createElement?: function(string, {}): HTMLElement, injectStyleLink?: function(string): void, query?: function((Element|string), string=): HTMLDivElement, querySelectorAttribs?: function((Element|string), (string|*), {}=): void}}
   */
  html = html;

  /**
   * Returns whether the module should be enabled by default. Should
   * return a truthy or falsy value.
   *
   * @returns {boolean}
   */
  static isEnabledByDefault = () => {
    return false;
  };

  /**
   * Returns the label displayed next to the checkbox on the settings page
   *
   * @returns {string}
   */
  getLabel = () => {
    throw new Error('getLabel not implemented.');
  };

  /**
   * Returns the help text displayed under the label on the settings page
   *
   * @returns {string}
   */
  getHelp = () => {
    return '';
  };

  /**
   * Returns a react component that will be displayed in a modal
   */
  getSettingsModal = () => {
  }
}

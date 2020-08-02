/**
 * Parent module class
 */
export default class Module {
    /**
     * @param {string} event
     * @param {*} detail
     */
    dispatch = (event, detail = {}) => {
        document.dispatchEvent(new CustomEvent(event, {
            detail
        }));
    };

    /**
     * @param {string} event
     * @param {Function} callback
     */
    listen = (event, callback) => {
        document.addEventListener(event, callback);
    };

    /**
     * Called in the content script
     */
    execContent = () => {};

    /**
     * Called in the context of the page
     */
    execInject = () => {};

    /**
     * Returns the HTML that's displayed on the settings page for this module
     *
     * @returns {string}
     */
    getSettings = () => {
        return '';
    };
}

/**
 * Inject internal script to available access to the window
 *
 * @param  {string} path
 * @param  {string} tag
 * @see    http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script
 */
export const injectScript = (path, tag) => {
    const node   = document.getElementsByTagName(tag)[0];
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', path);
    node.appendChild(script);
};

/**
 * @param {string} html
 * @returns {DocumentFragment}
 */
export const createTemplateContent = (html) => {
    const template = document.createElement('template');
    template.innerHTML = html;

    return template.content;
};

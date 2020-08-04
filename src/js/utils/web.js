/**
 * Inject script
 *
 * @param {string} path
 */
export const injectScript = (path) => {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', path);

  const body = document.getElementsByTagName('body')[0];
  body.appendChild(script);
};

/**
 * Inject css into the head
 *
 * @param {string} css
 */
export const injectCSS = (css) => {
  const style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  style.innerHTML = css;

  const head = document.getElementsByTagName('head')[0];
  head.appendChild(style);
};

/**
 * Injects an external stylesheet
 *
 * @param {string} url
 */
export const injectStyleLink = (url) => {
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', url);

  const head = document.getElementsByTagName('head')[0];
  head.appendChild(link);
};

/**
 * @param {string} html
 * @returns {DocumentFragment}
 */
export const createTemplateContent = (html) => {
  const template     = document.createElement('template');
  template.innerHTML = html;

  return template.content;
};

/**
 * @param {Element} ref
 * @param {Element} node
 */
export const insertAfter = (ref, node) => {
  ref.parentNode.insertBefore(node, ref.nextSibling);
};

/**
 * @param {HTMLElement} el
 * @param {{}} attribs
 */
export const setAttributes = (el, attribs) => {
  Object.keys(attribs).forEach((key) => {
    if (key === 'html') {
      el.innerHTML = attribs[key];
    } else if (key === 'text') {
      el.innerText = attribs[key];
    } else {
      el.setAttribute(key, attribs[key]);
    }
  });
};

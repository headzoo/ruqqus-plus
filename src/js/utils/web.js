/**
 * Inject script
 *
 * @param {string} path
 */
export const injectScript = (path) => {
  const body   = document.getElementsByTagName('body')[0];
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', path);
  body.appendChild(script);
};

/**
 * Inject css into the head
 *
 * @param {string} css
 */
export const injectCSS = (css) => {
  const head = document.getElementsByTagName('head')[0];
  const link = document.createElement('style');
  link.setAttribute('type', 'text/css');
  link.innerHTML = css;
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

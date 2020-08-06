import DOMPurify from 'dompurify';

/**
 * @param {Element} el
 * @param {string} html
 * @returns {Element}
 */
export const setHTML = (el, html) => {
  el.innerHTML = DOMPurify.sanitize(html, {
    // Allow "chrome-extension://" urls
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx|chrome-extension):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  });

  return el;
};

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
  style.innerText = css;

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
  const template = document.createElement('template');
  setHTML(template, html);

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
 * @returns {HTMLElement}
 */
export const setAttributes = (el, attribs) => {
  Object.keys(attribs).forEach((key) => {
    if (key === 'html') {
      setHTML(el, attribs[key]);
    } else if (key === 'text') {
      el.innerText = attribs[key];
    } else if (key === 'on') {
      Object.keys(attribs[key]).forEach((onKey) => {
        el.addEventListener(onKey, attribs[key][onKey], false);
      });
    } else {
      el.setAttribute(key, attribs[key]);
    }
  });

  return el;
};

/**
 * @param {string} tag
 * @param {{}} attribs
 * @returns {HTMLElement}
 */
export const createElement = (tag, attribs) => {
  const el = document.createElement(tag);
  return setAttributes(el, attribs);
};

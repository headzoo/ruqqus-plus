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
 * @param {Element} ref
 * @param {Element} node
 */
export const insertBefore = (ref, node) => {
  ref.parentNode.insertBefore(node, ref);
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

/**
 * @param {Element|DocumentFragment|string} context
 * @param {string|Function} selector
 * @param {Function} callback
 */
export const querySelectorEach = (context, selector, callback = null) => {
  if (typeof context === 'object') {
    context.querySelectorAll(selector).forEach(callback);
  } else {
    document.querySelectorAll(context).forEach(selector);
  }
};

/**
 * @param {Element|string} context
 * @param {string|*} selector
 * @param {{}} attribs
 */
export const querySelectorAttribs = (context, selector, attribs = {}) => {
  const isObj = typeof context === 'object';
  const base  = isObj ? context : document;
  base.querySelectorAll(isObj ? selector : context).forEach((el) => {
    setAttributes(el, isObj ? attribs : selector);
  });
};

/**
 * @param {Element|string} context
 * @param {string} selector
 * @returns {HTMLDivElement}
 */
export const query = (context, selector = '') => {
  let el;
  if (typeof context === 'object') {
    el = context.querySelector(selector);
  } else {
    el = document.querySelector(context);
  }
  if (!el) {
    el = document.createElement('div');
  }

  return el;
}

/**
 * @param {HTMLElement|Node} element
 * @param {string} className
 * @param {boolean} returnParent
 * @returns {boolean|HTMLElement|Node}
 */
export function hasParentClass(element, className, returnParent = false) {
  do {
    if (element.classList && element.classList.contains(className)) {
      if (returnParent) {
        return element;
      }
      return true;
    }
    element = element.parentNode;
  } while (element);

  return false;
}

export const getSelectionText = () => {
  let text = '';
  const activeEl = document.activeElement;
  const activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
  if (
    (activeElTagName === 'textarea') || (activeElTagName === 'input' &&
    /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
    (typeof activeEl.selectionStart == 'number')
  ) {
    text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
  } else if (window.getSelection) {
    text = window.getSelection().toString();
  }

  return text;
}

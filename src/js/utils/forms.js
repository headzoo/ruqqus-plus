/**
 * @param {HTMLFormElement} form
 * @returns {{}}
 */
const serialize = (form) => {
  if (!form || form.nodeName !== 'FORM') {
    return {};
  }

  const values       = {};
  const { elements } = form;
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (element.name === '') {
      continue; // eslint-disable-line
    }

    switch (element.nodeName) {
      case 'INPUT':
        switch (element.type) {
          case 'text':
          case 'hidden':
          case 'password':
          case 'button':
          case 'reset':
          case 'submit':
            values[element.name] = element.value;
            break;
          case 'checkbox':
          case 'radio':
            values[element.name] = element.checked ? 1 : 0;
            break;
        }
        break;
      case 'file':
        break;
      case 'TEXTAREA':
        values[element.name] = element.value;
        break;
      case 'SELECT':
        switch (element.type) {
          case 'select-one':
            values[element.name] = element.value;
            break;
        }
        break;
    }
  }

  return values;
};

/**
 * @param {HTMLFormElement} form
 * @param {{}} values
 */
const deserialize = (form, values) => {
  Object.keys(values).forEach((key) => {
    const element = form.querySelector(`[name="${key}"]`);
    if (!element) {
      return;
    }

    switch (element.nodeName) {
      case 'INPUT':
        switch (element.type) {
          case 'text':
          case 'hidden':
          case 'password':
          case 'button':
          case 'reset':
          case 'submit':
            element.value = values[key];
            break;
          case 'checkbox':
          case 'radio':
            element.checked = !!values[key];
            break;
        }
        break;
      case 'file':
        break;
      case 'TEXTAREA':
        element.value = values[key];
        break;
      case 'SELECT':
        switch (element.type) {
          case 'select-one':
            element.value = values[key];
            break;
        }
        break;
    }
  });
};

export default {
  serialize,
  deserialize
};

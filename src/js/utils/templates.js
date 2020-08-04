/**
 * @param {string} template
 * @param {{}} values
 * @returns {string}
 */
export const parseTemplate = (template, values) => {
  Object.keys(values).forEach((key) => {
    const r = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(r, values[key]);
  });

  return template;
};

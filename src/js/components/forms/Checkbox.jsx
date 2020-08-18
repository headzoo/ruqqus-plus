import React from 'react';
import PropTypes from 'prop-types';

const Checkbox = ({ id, name, checked, onChange, label, disabled }) => {
  return (
    <div className="custom-control custom-checkbox mr-4">
      <input
        type="checkbox"
        id={id}
        name={name}
        className="custom-control-input"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label className="custom-control-label" htmlFor={id}>
        &nbsp;{label}
      </label>
    </div>
  );
};

Checkbox.propTypes = {
  id:       PropTypes.string.isRequired,
  name:     PropTypes.string.isRequired,
  checked:  PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label:    PropTypes.string.isRequired,
  disabled: PropTypes.bool
};

Checkbox.defaultProps = {
  disabled: false
};

export default Checkbox;

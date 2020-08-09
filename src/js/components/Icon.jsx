import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Icon = ({ name, fas, far, mr, fixed, size, active, spinning, className, ...props }) => {
  return (
    <span
      className={classNames(
        className,
        `icon fa-${size}x fa-${name}`,
        {
          'fa':                     !far && !fas,
          'fa-spin':                spinning,
          'fas':                    fas,
          'far':                    far,
          'fa-fw':                  fixed,
          'icon-active':            active,
          'gutter-margin-right-sm': mr
        }
      )}
      aria-hidden="true"
      {...props}
    />
  );
};

Icon.propTypes = {
  name:      PropTypes.string.isRequired,
  fas:       PropTypes.bool,
  far:       PropTypes.bool,
  fixed:     PropTypes.bool,
  mr:        PropTypes.bool,
  size:      PropTypes.number,
  active:    PropTypes.bool,
  spinning:  PropTypes.bool,
  className: PropTypes.string
};

Icon.defaultProps = {
  fas:       false,
  far:       false,
  fixed:     true,
  size:      1,
  mr:        false,
  active:    false,
  spinning:  false,
  className: ''
};

export default Icon;

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const MaskChild = ({ className, children, visible, ...props }) => {
  const classes = classNames('mask-child', className, { visible });

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

MaskChild.propTypes = {
  visible:   PropTypes.bool,
  className: PropTypes.string,
  children:  PropTypes.node
};

MaskChild.defaultProps = {
  visible:   false,
  className: '',
  children:  ''
};


export default MaskChild;

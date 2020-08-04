import React from 'react';
import PropTypes from 'prop-types';

const Loading = ({ visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <img src="/images/loading.svg" alt="Loading" />
  );
};

Loading.propTypes = {
  visible: PropTypes.bool
};

Loading.defaultProps = {
  visible: true
};

export default Loading;

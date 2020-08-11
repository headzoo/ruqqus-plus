import React from 'react';
import PropTypes from 'prop-types';
import toastr from 'toastr';
import { Modal } from '../../components';
import storage from '../../utils/storage';

const SettingsModal = ({ open, onHidden }) => {
  /**
   *
   */
  const handleClearCacheClick = () => {
    storage.remove('BetterSidebarModule.guilds')
      .then(() => {
        toastr.success('Cache cleared', '', {
          closeButton:   true,
          positionClass: 'toast-bottom-center'
        });
      });
  };

  return (
    <Modal title="Sidebar Settings" open={open} onHidden={onHidden}>
      <button type="button" className="btn btn-secondary" onClick={handleClearCacheClick}>
        Clear Cache
      </button>
    </Modal>
  );
};

SettingsModal.propTypes = {
  open:     PropTypes.bool,
  onHidden: PropTypes.func
};

SettingsModal.defaultProps = {
  open:     false,
  onHidden: () => {}
};

export default SettingsModal;

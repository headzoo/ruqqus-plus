import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import toastr from 'toastr';
import { Modal } from '../../components';
import storage from '../../utils/storage';

const SettingsModal = ({ open, onHidden, onChange }) => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    storage.get('BetterSidebarModule.settings', {})
      .then((s) => {
        setSettings(s);
      });
  });

  /**
   *
   */
  const handleClearCacheClick = () => {
    storage.remove('BetterSidebarModule.guilds')
      .then(() => {
        onChange();
        toastr.success('Cache cleared!', '', {
          closeButton:   true,
          positionClass: 'toast-bottom-center'
        });
      });
  };

  /**
   * @param {Event} e
   */
  const handleChange = (e) => {
    const { target } = e;

    const newSettings = { ...settings };
    newSettings[target.name] = target.checked;
    storage.set('BetterSidebarModule.settings', newSettings)
      .then(() => {
        setSettings(newSettings);
        onChange();
      });
  };

  return (
    <Modal title="Sidebar Settings" open={open} onHidden={onHidden}>
      <div className="mb-4">
        <div className="custom-control custom-checkbox mb-2">
          <input
            type="checkbox"
            id="settings-better-sidebar-show-badge-nsfw"
            name="showBadgeNSFW"
            className="custom-control-input"
            checked={settings.showBadgeNSFW}
            onChange={handleChange}
          />
          <label className="custom-control-label" htmlFor="settings-better-sidebar-show-badge-nsfw">
            Show NSFW Badges
          </label>
        </div>
      </div>
      <button type="button" className="btn btn-secondary" onClick={handleClearCacheClick}>
        Clear Cache
      </button>
    </Modal>
  );
};

SettingsModal.propTypes = {
  open:     PropTypes.bool,
  onHidden: PropTypes.func,
  onChange: PropTypes.func
};

SettingsModal.defaultProps = {
  open:     false,
  onHidden: () => {},
  onChange: () => {}
};

export default SettingsModal;

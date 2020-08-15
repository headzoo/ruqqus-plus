import React from 'react';
import PropTypes from 'prop-types';
import toastr from 'toastr';
import { Modal } from '../../components';
import storage from '../../utils/storage';
import SettingsModalSectionItem from './SettingsModalSectionItem';

const SettingsModal = ({ open, settings, onHidden, onChange }) => {
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
        onChange();
      });
  };

  /**
   * @param {*} section
   * @param {number} fromIndex
   * @param {number} toIndex
   */
  const handleSectionChange = (section, fromIndex, toIndex) => {
    const newSettings = { ...settings };
    settings.sections.forEach((s, i) => {
      if (s.name === section.name) {
        newSettings.sections[i] = section;
      }
    });
    if (fromIndex !== toIndex) {
      newSettings.sections.splice(toIndex, 0, newSettings.sections.splice(fromIndex, 1)[0]);
    }

    storage.set('BetterSidebarModule.settings', newSettings)
      .then(() => {
        onChange();
      });
  };

  return (
    <Modal title="Sidebar Settings" open={open} onHidden={onHidden}>
      <div className="rp-better-sidebar-settings-modal">
        <div className="mb-4">
          <ul className="list-group">
            {settings.sections.map((section, i) => (
              <SettingsModalSectionItem
                key={section.name}
                section={section}
                index={i}
                onChange={handleSectionChange}
              />
            ))}
          </ul>
        </div>
        <div className="d-flex mb-4">
          <div className="custom-control custom-checkbox mr-4">
            <input
              type="checkbox"
              id="settings-better-sidebar-show-badge-nsfw"
              name="showBadgeNSFW"
              className="custom-control-input"
              checked={settings.showBadgeNSFW}
              onChange={handleChange}
            />
            <label className="custom-control-label" htmlFor="settings-better-sidebar-show-badge-nsfw">
              &nbsp;Show NSFW Badges
            </label>
          </div>
          <div className="custom-control custom-checkbox mr-4">
            <input
              type="checkbox"
              id="settings-better-sidebar-show-create"
              name="showCreate"
              className="custom-control-input"
              checked={settings.showCreate}
              onChange={handleChange}
            />
            <label className="custom-control-label" htmlFor="settings-better-sidebar-show-create">
              &nbsp;Show Create Button
            </label>
          </div>
          <div className="custom-control custom-checkbox mr-4">
            <input
              type="checkbox"
              id="settings-better-sidebar-show-favorite"
              name="showFavorite"
              className="custom-control-input"
              checked={settings.showFavorite}
              onChange={handleChange}
            />
            <label className="custom-control-label" htmlFor="settings-better-sidebar-show-favorite">
              &nbsp;Show Favorite Button
            </label>
          </div>
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleClearCacheClick}>
          Clear Cache
        </button>
      </div>
    </Modal>
  );
};

SettingsModal.propTypes = {
  open:     PropTypes.bool,
  settings: PropTypes.object.isRequired,
  onHidden: PropTypes.func,
  onChange: PropTypes.func
};

SettingsModal.defaultProps = {
  open:     false,
  onHidden: () => {},
  onChange: () => {}
};

export default SettingsModal;

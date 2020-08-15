import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../../components';

const SettingsModalSectionItem = ({ section, index, onChange }) => {
  /**
   *
   */
  const handleCheckChange = () => {
    const newSection = { ...section };
    newSection.visible = !newSection.visible;
    onChange(newSection, index, index);
  };

  return (
    <li className="list-group-item d-flex align-items-center">
      <div className="btn-group mr-4">
        <button
          type="button"
          className="btn btn-secondary"
          title="Move Up"
          disabled={index === 0}
          onClick={() => onChange(section, index, index - 1)}
        >
          <Icon name="caret-up" />
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          title="Move Down"
          disabled={index === 3}
          onClick={() => onChange(section, index, index + 1)}
        >
          <Icon name="caret-down" />
        </button>
      </div>
      <div className="custom-control custom-checkbox">
        <input
          type="checkbox"
          id={`settings-better-sidebar-section-${section.name}`}
          name={section.name}
          className="custom-control-input"
          checked={section.visible}
          onChange={handleCheckChange}
        />
        <label className="custom-control-label" htmlFor={`settings-better-sidebar-section-${section.name}`}>
          &nbsp;
        </label>
      </div>
      <div>
        {section.label}
      </div>
    </li>
  );
};

SettingsModalSectionItem.propTypes = {
  section:  PropTypes.object.isRequired,
  index:    PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

export default SettingsModalSectionItem;

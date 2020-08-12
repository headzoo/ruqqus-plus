import React, { useEffect, useState } from 'react';
import storage from '../../utils/storage';
import mods from '../../modules';
import { Icon, Modal } from '../../components';

const Settings = () => {
  const [loaded, setLoaded]             = useState({});
  const [modules, setModules]           = useState({});
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    storage.get('modules', {})
      .then((active) => {
        Object.keys(mods).forEach((key) => {
          if (active[key] === undefined) {
            active[key] = mods[key].isEnabledByDefault();
          }
        });
        setModules(active);

        const newLoaded = {};
        Object.keys(active).forEach((key) => {
          if (mods[key]) {
            newLoaded[key] = new mods[key]();
          }
        });
        setLoaded(newLoaded);
      });
  }, []);

  /**
   * @param {*} e
   */
  const handleCheckChange = (e) => {
    const { name }   = e.target;
    const newModules = { ...modules };
    newModules[name] = e.target.checked;

    storage.set('modules', newModules)
      .then(() => {
        setModules(newModules);
        const newLoaded = { ...loaded };
        newLoaded[name] = new mods[name]();
        setLoaded(newLoaded);
      });
  };

  /**
   * @param {*} e
   * @param {string} key
   */
  const handleSettingsClick = (e, key) => {
    e.preventDefault();

    const keys = Object.keys(loaded);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === key) {
        setModalContent(loaded[keys[i]]);
        break;
      }
    }
  };

  return (
    <form className="pt-2">
      <div className="mb-4">
        {Object.keys(loaded).map((key) => (
          <div key={key} className="custom-control custom-checkbox mb-2">
            <input
              type="checkbox"
              name={key}
              id={`setting-${key}`}
              className="custom-control-input"
              checked={!!modules[key]}
              onChange={handleCheckChange}
            />
            <label className="custom-control-label" htmlFor={`setting-${key}`}>
              {loaded[key].getLabel()}
              {loaded[key].getSettingsModal() && (
                <Icon
                  name="cog"
                  title="Settings"
                  className="ml-2 text-muted settings-cog-icon"
                  onClick={(e) => handleSettingsClick(e, key)}
                />
              )}
            </label>
            <div className="text-muted">{loaded[key].getHelp()}</div>
          </div>
        ))}
      </div>
      {modalContent && (
        <Modal onHidden={() => setModalContent(null)} open>
          {React.createElement(modalContent.getSettingsModal())}
        </Modal>
      )}
    </form>
  );
};

export default Settings;

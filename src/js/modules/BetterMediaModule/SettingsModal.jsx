import React from 'react';
import { toastSuccess } from '../../utils/toast';
import { Checkbox } from '../../components/forms';
import storage from '../../utils/storage';
import defaultSettings from './defaultSettings';

export default class SettingsModal extends React.Component {
  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.state = {
      settings: defaultSettings
    };
  }

  /**
   *
   */
  componentDidMount() {
    storage.get('BetterMediaModule.settings', defaultSettings)
      .then((settings) => {
        this.setState({
          settings: { ...defaultSettings, ...settings }
        });
      });
  }

  /**
   * @param {Event} e
   */
  handleChange = (e) => {
    const { settings } = this.state;

    const newSettings = { ...settings };
    newSettings[e.target.name] = e.target.checked;
    storage.set('BetterMediaModule.settings', newSettings)
      .then(() => {
        this.setState({ settings: newSettings });
        toastSuccess('Settings saved.');
      });
  };

  /**
   * @param {Event} e
   */
  handlePopupChange = (e) => {
    const { settings } = this.state;

    const newSettings = { ...settings };
    newSettings.popups[e.target.name].enabled = e.target.checked;
    console.log(newSettings);
    storage.set('BetterMediaModule.settings', newSettings)
      .then(() => {
        this.setState({ settings: newSettings });
        toastSuccess('Settings saved.');
      });
  };

  /**
   * @returns {*}
   */
  render = () => {
    const { settings } = this.state;
    const { popups } = defaultSettings;

    return (
      <div>
        <h6 className="mb-2">
          Better Media Settings
        </h6>
        <div className="rp-list-group mb-2">
          <Checkbox
            id="settings-better-media-watch-posts"
            name="watchPosts"
            checked={settings.watchPosts}
            onChange={this.handleChange}
            label="Embed images, videos and tweets inside of post pages"
          />
          <Checkbox
            id="settings-better-media-watch-thumbs"
            name="watchThumbs"
            checked={settings.watchThumbs}
            onChange={this.handleChange}
            label="Popup images and videos when clicking on thumbnails"
          />
        </div>
        <div className="rp-list-group">
          <div className="row">
            {Object.keys(popups).map((key) => (
              <div key={key} className="col-6">
                <Checkbox
                  name={key}
                  label={`Popup ${popups[key].label}`}
                  onChange={this.handlePopupChange}
                  id={`settings-better-media-popup-${key}`}
                  checked={settings.popups[key].enabled}
                  disabled={!settings.watchThumbs}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
}

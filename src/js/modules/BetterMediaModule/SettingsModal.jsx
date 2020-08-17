import React from 'react';
import { toastSuccess } from '../../utils/toast';
import storage from '../../utils/storage';

const defaultSettings = {
  watchPosts:  true,
  watchThumbs: true
};

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
        this.setState({ settings });
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
   * @returns {*}
   */
  render = () => {
    const { settings } = this.state;

    return (
      <div>
        <h6 className="mb-4">
          Better Media Settings
        </h6>
        <div className="form-group">
          <div className="custom-control custom-checkbox mr-4">
            <input
              type="checkbox"
              id="settings-better-media-watch-posts"
              name="watchPosts"
              className="custom-control-input"
              checked={settings.watchPosts}
              onChange={this.handleChange}
            />
            <label className="custom-control-label" htmlFor="settings-better-media-watch-posts">
              &nbsp;Embed images and media in posts
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="custom-control custom-checkbox mr-4">
            <input
              type="checkbox"
              id="settings-better-media-watch-thumbs"
              name="watchThumbs"
              className="custom-control-input"
              checked={settings.watchThumbs}
              onChange={this.handleChange}
            />
            <label className="custom-control-label" htmlFor="settings-better-media-watch-thumbs">
              &nbsp;Show popup when clicking thumbnails
            </label>
          </div>
        </div>
      </div>
    );
  };
}

import React from 'react';
import toastr from 'toastr';
import storage from '../../utils/storage';
import defaultSettings from './defaultSettings';

export default class SettingsModal extends React.Component {
  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.state = {
      settings: { ...defaultSettings }
    };
  }

  /**
   *
   */
  componentDidMount() {
    storage.get('DefaultSortModule.settings', defaultSettings)
      .then((settings) => {
        this.setState({ settings });
      });
  }

  /**
   * @param {Event} e
   */
  handleChange = (e) => {
    const { settings } = e.target;

    const newSettings = { ...settings };
    newSettings[e.target.name] = e.target.value;
    storage.set('DefaultSortModule.settings', newSettings)
      .then(() => {
        this.setState({ settings: newSettings });
        toastr.success('Settings saved!', '', {
          closeButton:   true,
          positionClass: 'toast-bottom-center'
        });
      });
  };

  /**
   * @returns {*}
   */
  render = () => {
    const { settings } = this.state;

    return (
      <div>
        <h6 className="mb-3">
          Default Sort Settings
        </h6>
        <div className="rp-list-group">
          <div className="form-group">
            <label htmlFor="settings-guild-sort">
              Guild Sorting
            </label>
            <select
              name="guildSort"
              id="settings-guild-sort"
              className="form-control"
              value={settings.guildSort}
              onChange={this.handleChange}
            >
              <option value="hot">Hot</option>
              <option value="top">Top</option>
              <option value="new">New</option>
              <option value="disputed">Disputed</option>
              <option value="activity">Activity</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="settings-guild-sort">
              Comments Sorting
            </label>
            <select
              name="commentsSort"
              id="settings-comments-sort"
              className="form-control"
              value={settings.commentsSort}
              onChange={this.handleChange}
            >
              <option value="new">New</option>
              <option value="top">Top</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>
        </div>
      </div>
    );
  };
}

import React from 'react';
import toastr from 'toastr';
import storage from '../../utils/storage';

export default class SettingsModal extends React.Component {
  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.state = {
      value: ''
    };
  }

  /**
   *
   */
  componentDidMount() {
    storage.get('ChangeHomeLinkModule.url', '/')
      .then((url) => {
        this.setState({ value: url });
      });
  }

  /**
   *
   */
  handleSaveClick = () => {
    const { value } = this.state;

    storage.set('ChangeHomeLinkModule.url', value)
      .then(() => {
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
    const { value } = this.state;

    return (
      <div>
        <h6>Change Home Link Settings</h6>
        <div className="form-group">
          <label htmlFor="input-change-home-link-url">
            URL to open when ruqqus logo is clicked.
          </label>
          <div className="d-flex">
            <input
              id="input-change-home-link-url"
              className="form-control mr-2"
              value={value}
              onChange={(e) => this.setState({ value: e.target.value })}
            />
            <button type="button" className="btn btn-primary" onClick={this.handleSaveClick}>
              Save
            </button>
          </div>
          <small className="text-muted form-text">
            For example &quot;/all?sort=new&quot;.
          </small>
        </div>
      </div>
    );
  };
}

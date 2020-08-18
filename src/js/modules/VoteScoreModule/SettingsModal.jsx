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
    storage.get('VoteScoreModule.display', 'score')
      .then((display) => {
        this.setState({ value: display });
      });
  }

  /**
   * @param {Event} e
   */
  handleChange = (e) => {
    const { value } = e.target;

    storage.set('VoteScoreModule.display', value)
      .then(() => {
        this.setState({ value });
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
        <h6 className="mb-3">
          Vote Score Settings
        </h6>
        <div className="rp-list-group">
          <div className="custom-control custom-radio">
            <input
              type="radio"
              id="input-display-score"
              className="custom-control-input"
              checked={value === 'score'}
              onClick={this.handleChange}
              value="score"
            />
            <label className="custom-control-label" htmlFor="input-display-score">
              Display +/- score
            </label>
          </div>
          <div className="custom-control custom-radio">
            <input
              type="radio"
              id="input-display-percent"
              className="custom-control-input"
              checked={value === 'percent'}
              onClick={this.handleChange}
              value="percent"
            />
            <label className="custom-control-label" htmlFor="input-display-percent">
              Display % upvote percentage
            </label>
          </div>
        </div>
      </div>
    );
  };
}

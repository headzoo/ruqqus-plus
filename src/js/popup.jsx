import React from 'react';
import ReactDOM from 'react-dom';
import { Loading } from './components';
import * as constants from './utils/constants';

class App extends React.Component {
  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      authed:  false,
      user:    null,
      unread:  0
    };
  }

  /**
   *
   */
  componentDidMount() {
    chrome.storage.sync.get(['authed', 'user', 'unread'], (values) => {
      const { authed, user, unread } = values;

      this.setState({ authed, user, unread, loading: false });
    });

    this.port = chrome.extension.connect({
      name: 'user'
    });
    this.port.onMessage.addListener((msg) => {
      switch (msg.type) {
        case constants.TYPE_AUTH:
          const { authed, user, unread } = msg; // eslint-disable-line

          user.rep = parseInt(user.post_rep, 10) + parseInt(user.comment_rep, 10);
          chrome.storage.sync.set({
            authed,
            user,
            unread
          });
          this.setState({ authed, user, unread, loading: false });
          break;
      }
    });
  }

  /**
   *
   */
  handleUnreadClick = () => {
    this.setState({ unread: 0 });
    this.port.postMessage({
      type:   constants.TYPE_UNREAD,
      unread: 0
    });
  };

  /**
   * @returns {*}
   */
  render() {
    const { authed, user, unread, loading } = this.state;

    return (
      <div>
        <header className="p-2 mb-3">
          <div className="container">
            <h1>Ruqqus Plus</h1>
          </div>
        </header>
        <div className="container">
          <Loading visible={loading} />
          {authed && (
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <div className="d-flex justify-content-between align-items-center">
                <img src={user.profile_url} alt="Avatar" className="avatar mr-2" />
                <div className="d-flex flex-column">
                  <span className="username mr-2">{user.username}</span>
                  <div>
                    <span id="container-authed-rep" className="rep">
                      {user.rep}&nbsp;Rep
                    </span>
                  </div>
                </div>
              </div>
              <a
                className="position-relative"
                href="https://ruqqus.com/notifications"
                target="_blank"
                onClick={this.handleUnreadClick}
              >
                <i className={`fas fa-bell ${unread > 0 ? 'text-danger' : ''}`} />
                {unread > 0 && (
                  <span className="badge-count font-weight-bolder">{unread}</span>
                )}
              </a>
            </div>
          )}
          {!authed && (
            <div className="mb-2 hidden">
              <a href="https://ruqqus.com" target="_blank">
                Log into ruqqus
              </a>
            </div>
          )}
          <div className="btn-group w-100">
            <a className="btn btn-sm btn-primary" href="settings.html" target="_blank">
              Settings
            </a>
            <a className="btn btn-sm btn-primary" href="https://ruqqus.com/+RuqqusPlus" target="_blank">
              Support
            </a>
            <a className="btn btn-sm btn-primary" href="about.html" target="_blank">
              About
            </a>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('mount')
);

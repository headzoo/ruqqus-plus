import React from 'react';
import ReactDOM from 'react-dom';
import { Loading } from './components';
import { fetchMe, fetchUser } from './utils/ruqqus';
import events from './utils/events';

class App extends React.Component {
  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.state = {
      unread:  0,
      user:    null,
      loading: true
    };
  }

  /**
   *
   */
  componentDidMount() {
    fetchMe()
      .then(({ authed, unread, username }) => {
        if (authed) {
          fetchUser(username)
            .then((user) => {
              this.setState({ unread, user, loading: false });
            });
        } else {
          this.setState({ loading: false });
        }
      });
  }

  /**
   *
   */
  handleUnreadClick = () => {
    this.setState({ unread: 0 });

    // Let the background script (UserAction) know about zeroing out
    // the unread count so it can change the badge text.
    chrome.runtime.sendMessage({
      event: 'rq.setUnread',
      data:  { unread: 0 }
    });
  };

  /**
   * @returns {*}
   */
  render() {
    const { loading, user, unread } = this.state;

    return (
      <div>
        <header className="mb-3 text-center">
          <img src="../images/icon-32.png" alt="Logo" />
        </header>
        <div className="container">
          {loading ? (
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <Loading visible />
              <a
                className="position-relative"
                href="https://ruqqus.com/notifications"
                target="_blank"
                onClick={this.handleUnreadClick}
              >
                <i className="fas fa-bell" />
              </a>
            </div>
          ) : (
            <div className="mb-3 d-flex justify-content-between align-items-center">
              {user ? (
                <>
                  <div className="d-flex justify-content-between align-items-center">
                    <img src={user.profile_url} alt="Avatar" className="avatar mr-2" />
                    <div className="d-flex flex-column">
                      <span className="username mr-2">{user.username}</span>
                      <div>
                    <span id="container-authed-rep" className="rep">
                      {parseInt(user.post_rep, 10) + parseInt(user.comment_rep, 10)}&nbsp;Rep
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
                </>
              ) : (
                <div>
                  <a href="https://ruqqus.com" target="_blank">
                    Log into Ruqqus
                  </a>
                </div>
              )}
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

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import { Store } from 'webext-redux';
import { userActions } from './redux/actions';

class App extends React.Component {
  static propTypes = {
    unread:   PropTypes.number.isRequired,
    user:     PropTypes.object,
    dispatch: PropTypes.func
  };

  /**
   *
   */
  handleUnreadClick = () => {
    const { dispatch } = this.props;

    dispatch(userActions.setUnread(0));
  };

  /**
   * @returns {*}
   */
  render() {
    const { user, unread } = this.props;

    return (
      <div>
        <header className="mb-3 text-center">
          <img src="../images/icon-32.png" alt="Logo" />
        </header>
        <div className="container">
          {user && (
            <div className="mb-3 d-flex justify-content-between align-items-center">
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
            </div>
          )}
          {!user && (
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

const mapStateToProps = (state) => ({
  unread: state.user.unread,
  user:   state.user.user
});

const Connected = connect(mapStateToProps)(App);
const store = new Store();

store.ready().then(() => {
  ReactDOM.render(
    <Provider store={store}>
      <Connected />
    </Provider>,
    document.getElementById('mount')
  );
});

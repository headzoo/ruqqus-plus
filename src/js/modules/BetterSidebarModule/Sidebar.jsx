import React from 'react';
import classNames from 'classnames';
import { fetchMyGuilds } from '../../utils/ruqqus';
import storage from '../../utils/storage';
import { searchByObjectKey } from '../../utils/arrays';
import GuildList from './GuildList';

export default class Sidebar extends React.PureComponent {
  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.state = {
      guilds:      null,
      favorites:   [],
      isCollapsed: localStorage.getItem('sidebarPref') === 'collapsed',
      filterValue: ''
    };

    this.views = {};
  }

  /**
   *
   */
  componentDidMount() {
    storage.get('BetterSidebarModule.views', {})
      .then((views) => {
        this.views = views;

        // Guilds are cached in storage for 10 minutes.
        storage.get('BetterSidebarModule.guilds')
          .then((guilds) => {
            if (guilds) {
              this.setState({
                guilds: this.sortGuilds(guilds)
              });
            } else {
              fetchMyGuilds()
                .then((g) => {
                  this.setState({
                    guilds: this.sortGuilds(g)
                  });
                  storage.set('BetterSidebarModule.guilds', g, 600 * 1000);
                });
            }
          });

        storage.get('BetterSidebarModule.favorites', [])
          .then((favorites) => {
            this.setState({ favorites });
          });
      });
  }

  /**
   * @param {[]} guilds
   * @returns {[]}
   */
  sortGuilds = (guilds) => {
    const keys = Object.keys(this.views).sort((a, b) => {
      return this.views[a] > this.views[b] ? -1 : 1;
    });

    const newGuilds = [];
    keys.forEach((key) => {
      const index = searchByObjectKey(guilds, 'name', key);
      if (index !== -1) {
        newGuilds.push(guilds[index]);
      }
    });
    guilds.forEach((guild) => {
      if (keys.indexOf(guild.name) === -1) {
        newGuilds.push(guild);
      }
    });

    return newGuilds;
  };

  /**
   * @param {Event} e
   */
  handleFilterChange = (e) => {
    const { value } = e.target;

    this.setState({ filterValue: value });
  };

  /**
   * @param {Event} e
   * @param {*} guild
   */
  handleFavorite = (e, guild) => {
    const { favorites } = this.state;
    const { name } = guild;
    e.preventDefault();

    const newFavorites = Array.from(favorites);
    const index = favorites.indexOf(name);
    if (index === -1) {
      newFavorites.push(name);
    } else {
      newFavorites.splice(index, 1);
    }

    storage.set('BetterSidebarModule.favorites', newFavorites)
      .then(() => {
        this.setState({
          favorites: newFavorites
        });
      });
  };

  /**
   *
   */
  handleCollapseClick = () => {
    const { isCollapsed } = this.state;

    const newIsCollapsed = !isCollapsed;
    this.setState({ isCollapsed: newIsCollapsed });
    if (newIsCollapsed) {
      localStorage.setItem('sidebarPref', 'collapsed');
    } else {
      localStorage.removeItem('sidebarPref');
    }
  };

  /**
   * @returns {*}
   */
  renderFilterInput = () => {
    const { isCollapsed, filterValue } = this.state;

    return (
      <div className="form-group">
        <input
          placeholder={isCollapsed ? '' : 'Filter Guilds'}
          className={`form-control mb-2 rp-sidebar-guild-filter ${isCollapsed && 'form-control-sm'}`}
          onChange={this.handleFilterChange}
          value={filterValue}
        />
      </div>
    );
  };

  /**
   * @returns {*}
   */
  renderRuqqusFeeds = () => {
    const { isCollapsed, filterValue } = this.state;

    if (filterValue !== '') {
      return null;
    }

    let classes = 'd-flex justify-content-between align-items-center mb-3';
    if (isCollapsed) {
      classes = 'd-flex justify-content-center align-items-center mb-3';
    }

    return (
      <div className="mb-4">
        <div className="sidebar-collapsed-hidden">
          <div className={classes}>
            {!isCollapsed && (
              <div
                className="text-small font-weight-bold text-muted text-uppercase"
                style={{ letterSpacing: '0.025rem' }}
              >
                Ruqqus Feeds
              </div>
            )}
            <button
              type="button"
              className="btn"
              title="Collapse"
              onClick={this.handleCollapseClick}
            >
              {isCollapsed ? (
                <i className="fas fa-chevron-circle-right rp-better-sidebar-collapse rp-better-sidebar-guild-icon" />
              ) : (
                <i className="fas fa-chevron-circle-left rp-better-sidebar-collapse rp-better-sidebar-guild-icon" />
              )}
            </button>
          </div>
        </div>
        <ul className="no-bullets guild-recommendations-list pl-0">
          <li className="guild-recommendations-item rp-better-sidebar-item">
            <a href="/">
              <div className="d-flex">
                <div>
                  <img src="/assets/images/icons/house-alt.png" className="profile-pic profile-pic-30" alt="" />
                </div>
                {!isCollapsed && (
                  <div className="my-auto ml-2">
                    <div className="text-black font-weight-normal">Home</div>
                  </div>
                )}
              </div>
            </a>
          </li>
          <li className="guild-recommendations-item rp-better-sidebar-item">
            <a href="/all?sort=new">
              <div className="d-flex">
                <div>
                  <img src="/assets/images/icons/planet.png" className="profile-pic profile-pic-30" alt="" />
                </div>
                {!isCollapsed && (
                  <div className="my-auto ml-2">
                    <div className="text-black font-weight-normal">All</div>
                  </div>
                )}
              </div>
            </a>
          </li>
          <li className="guild-recommendations-item rp-better-sidebar-item">
            <a href="/all">
              <div className="d-flex">
                <div>
                  <img src="/assets/images/icons/flame.png" className="profile-pic profile-pic-30" alt="" />
                </div>
                {!isCollapsed && (
                  <div className="my-auto ml-2">
                    <div className="text-black font-weight-normal">Trending</div>
                  </div>
                )}
              </div>
            </a>
          </li>
        </ul>
      </div>
    );
  };

  /**
   * @returns {*}
   */
  renderFavoriteGuilds = () => {
    const { favorites, guilds, isCollapsed, filterValue } = this.state;

    if (favorites.length === 0 || !guilds || filterValue !== '') {
      return null;
    }

    const favoriteGuilds = [];
    favorites.forEach((guildName) => {
      const index = searchByObjectKey(guilds, 'name', guildName);
      if (index !== -1) {
        favoriteGuilds.push(guilds[index]);
      }
    });
    if (favoriteGuilds.length === 0) {
      return null;
    }

    return (
      <GuildList
        title="Favorite Guilds"
        icon="star"
        guilds={favoriteGuilds}
        favorites={favorites}
        isCollapsed={isCollapsed}
        onFavorite={this.handleFavorite}
      />
    );
  };

  /**
   * @returns {*}
   */
  renderMyGuilds = () => {
    const { guilds, favorites, isCollapsed, filterValue } = this.state;

    if (!guilds) {
      return null;
    }

    let newGuilds = guilds.filter((g) => {
      return !g.isMaster;
    });
    if (filterValue !== '') {
      const input = filterValue.toLowerCase();
      newGuilds   = guilds.filter((g) => {
        return g.name.toLowerCase().indexOf(input) !== -1;
      });
    }

    return (
      <GuildList
        title="My Guilds"
        icon="chess-rook"
        guilds={newGuilds}
        favorites={favorites}
        isCollapsed={isCollapsed}
        onFavorite={this.handleFavorite}
      />
    );
  };

  /**
   * @returns {*}
   */
  renderGuildMasterGuilds = () => {
    const { guilds, favorites, isCollapsed, filterValue } = this.state;

    if (!guilds || filterValue !== '') {
      return null;
    }

    const newGuilds = guilds.filter((g) => {
      return g.isMaster;
    });

    return (
      <GuildList
        title="GuildMaster Of"
        icon="crown"
        guilds={newGuilds}
        favorites={favorites}
        isCollapsed={isCollapsed}
        onFavorite={this.handleFavorite}
      />
    );
  };

  /**
   * @returns {*}
   */
  render() {
    const { isCollapsed } = this.state;

    // eslint-disable-next-line max-len
    const classes = classNames('col sidebar sidebar-left rp-better-sidebar-sidebar hide-scrollbar bg-white border-right d-none d-lg-block pt-3', {
      'rp-better-sidebar-sidebar-collapsed': isCollapsed
    });

    return (
      <div
        id="sidebar-left"
        className={classes}
        style={{ overflowY: 'auto', height: 'calc(100vh - 49px' }}
      >
        <div className="sidebar-section sidebar-trending" style={{ wordBreak: 'break-word' }}>
          <div className="body p-0">
            {this.renderFilterInput()}
            {this.renderRuqqusFeeds()}
            {this.renderFavoriteGuilds()}
            {this.renderMyGuilds()}
            {this.renderGuildMasterGuilds()}
          </div>
        </div>
      </div>
    );
  }
}

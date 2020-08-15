import React from 'react';
import classNames from 'classnames';
import { Icon } from '../../components';
import { fetchMyGuilds } from '../../utils/ruqqus';
import storage from '../../utils/storage';
import { searchByObjectKey } from '../../utils/arrays';
import SettingsModal from './SettingsModal';
import GuildList from './GuildList';
import SidebarTools from './SidebarTools';

const defaultSettings = {
  showBadgeNSFW: true,
  showCreate:    true,
  showFavorite:  true,
  sections:      [
    { name: 'ruqqus',      label: 'Ruqqus Feeds',   visible: true },
    { name: 'favorites',   label: 'Favorite Guilds', visible: true },
    { name: 'mine',        label: 'My Guilds',       visible: true },
    { name: 'guildmaster', label: 'Guildmaster Of',  visible: true }
  ]
};

export default class Sidebar extends React.PureComponent {
  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.state = {
      guilds:       null,
      favorites:    [],
      loading:      true,
      isCollapsed:  localStorage.getItem('sidebarPref') === 'collapsed',
      filterValue:  '',
      settingsOpen: false,
      settings:     { ...defaultSettings }
    };

    this.views = {};
  }

  /**
   *
   */
  async componentDidMount() {
    try {
      // await storage.remove('BetterSidebarModule.settings');
      this.views      = await storage.get('BetterSidebarModule.views', {});
      const settings  = await storage.get('BetterSidebarModule.settings', defaultSettings);
      const favorites = await storage.get('BetterSidebarModule.favorites', []);
      this.setState({ settings, favorites });

      const guilds = await storage.get('BetterSidebarModule.guilds');
      if (guilds) {
        this.setState({
          guilds:  this.sortGuilds(guilds),
          loading: false
        });
      } else {
        fetchMyGuilds()
          .then((g) => {
            this.setState({
              guilds:  this.sortGuilds(g),
              loading: false
            });
            storage.set('BetterSidebarModule.guilds', g, 86400 * 1000);
          });
      }
    } catch (error) {
      console.error(error);
      this.setState({ loading: false });
    }
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
   *
   */
  handleSettingsClick = () => {
    this.setState({ settingsOpen: true });
  };

  /**
   *
   */
  handleSettingsChange = () => {
    storage.get('BetterSidebarModule.settings', defaultSettings)
      .then((settings) => {
        this.setState({ settings });
      });
  };

  /**
   * @param {Event} e
   * @param {string} tool
   */
  handleToolClick = (e, tool) => {
    if (tool === 'settings') {
      this.handleSettingsClick();
    } else if (tool === 'collapse') {
      this.handleCollapseClick();
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
   * @param {boolean} isTop
   * @returns {*}
   */
  renderRuqqusFeeds = (isTop) => {
    const { isCollapsed, filterValue } = this.state;

    if (filterValue !== '') {
      return null;
    }

    let classes = 'd-flex justify-content-between align-items-center mb-3';
    if (isCollapsed) {
      classes = 'd-flex justify-content-center align-items-center mb-3';
    }

    return (
      <div key="ruqqus" className="mb-4">
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
            {isTop && (
              <SidebarTools
                isCollapsed={isCollapsed}
                onClick={this.handleToolClick}
              />
            )}
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
   * @param {boolean} isTop
   * @returns {*}
   */
  renderFavoriteGuilds = (isTop) => {
    const { favorites, settings, guilds, isCollapsed, filterValue } = this.state;

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
        key="favorites"
        title="Favorite Guilds"
        icon="star"
        isTop={isTop}
        guilds={favoriteGuilds}
        favorites={favorites}
        settings={settings}
        isCollapsed={isCollapsed}
        onToolClick={this.handleToolClick}
        onFavorite={this.handleFavorite}
      />
    );
  };

  /**
   * @param {boolean} isTop
   * @returns {*}
   */
  renderMyGuilds = (isTop) => {
    const { guilds, favorites, settings, isCollapsed, filterValue } = this.state;

    if (!guilds) {
      return null;
    }

    let newGuilds = guilds.filter((g) => {
      return !g.isMaster && favorites.indexOf(g.name) === -1;
    });
    if (filterValue !== '') {
      const input = filterValue.toLowerCase();
      newGuilds   = guilds.filter((g) => {
        return g.name.toLowerCase().indexOf(input) !== -1;
      });
    }

    return (
      <GuildList
        key="mine"
        title="My Guilds"
        icon="chess-rook"
        isTop={isTop}
        guilds={newGuilds}
        favorites={favorites}
        settings={settings}
        isCollapsed={isCollapsed}
        onToolClick={this.handleToolClick}
        onFavorite={this.handleFavorite}
      />
    );
  };

  /**
   * @param {boolean} isTop
   * @returns {*}
   */
  renderGuildMasterGuilds = (isTop) => {
    const { guilds, favorites, settings, isCollapsed, filterValue } = this.state;

    if (!guilds || filterValue !== '') {
      return null;
    }

    const newGuilds = guilds.filter((g) => {
      return g.isMaster;
    });

    return (
      <GuildList
        key="gm"
        title="GuildMaster Of"
        icon="crown"
        isTop={isTop}
        guilds={newGuilds}
        favorites={favorites}
        settings={settings}
        isCollapsed={isCollapsed}
        onToolClick={this.handleToolClick}
        onFavorite={this.handleFavorite}
      />
    );
  };

  /**
   * @returns {*}
   */
  render() {
    const { loading, settings, isCollapsed, settingsOpen } = this.state;

    // eslint-disable-next-line max-len
    const classes = classNames('col sidebar sidebar-left rp-better-sidebar-sidebar hide-scrollbar bg-white border-right d-none d-lg-block pt-3', {
      'rp-better-sidebar-sidebar-collapsed': isCollapsed
    });

    const sections = {
      ruqqus:      this.renderRuqqusFeeds,
      favorites:   this.renderFavoriteGuilds,
      mine:        this.renderMyGuilds,
      guildmaster: this.renderGuildMasterGuilds
    };
    let isTop = true;
    const sectionsToRender = settings.sections.map((section) => {
      if (section.visible) {
        const s = sections[section.name](isTop);
        isTop = false;
        return s;
      }
      return null;
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
            {sectionsToRender}
            {loading && (
              <img src={chrome.runtime.getURL('images/loading.svg')} alt="Loading" />
            )}
          </div>
          <div className="d-flex">
            <a href="/mine" className="btn btn-secondary btn-sm mr-1" title="Your guilds">
              Browse
            </a>
            <a href="/browse" className="btn btn-secondary btn-sm mr-1" title="Discover guilds">
              Discover
            </a>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              title="Sidebar settings"
              onClick={this.handleSettingsClick}
            >
              <Icon name="cog" />
            </button>
          </div>
        </div>
        {settingsOpen && (
          <SettingsModal
            settings={settings}
            onHidden={() => this.setState({ settingsOpen: false })}
            onChange={this.handleSettingsChange}
            open
          />
        )}
      </div>
    );
  }
}

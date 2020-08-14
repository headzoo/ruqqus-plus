import React from 'react';
import PropTypes from 'prop-types';
import GuildListItem from './GuildListItem';

const GuildList = ({ title, icon, guilds, favorites, settings, isCollapsed, onFavorite }) => {
  return (
    <div className="mb-4">
      <div>
        {isCollapsed ? (
          <div className="d-flex justify-content-center align-items-center mb-4">
            <i className={`fas fa-${icon} rp-better-sidebar-guild-icon`} />
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div
              className="text-small font-weight-bold text-muted text-uppercase"
              style={{ letterSpacing: '0.025rem' }}
            >
              {title}
            </div>
          </div>
        )}
      </div>
      <ul className="no-bullets guild-recommendations-list pl-0">
        {guilds.map((guild) => (
          <GuildListItem
            key={guild.name}
            guild={guild}
            settings={settings}
            favorites={favorites}
            isCollapsed={isCollapsed}
            onFavorite={onFavorite}
          />
        ))}
      </ul>
    </div>
  );
};

GuildList.propTypes = {
  title:       PropTypes.string.isRequired,
  icon:        PropTypes.string.isRequired,
  guilds:      PropTypes.array,
  favorites:   PropTypes.array,
  settings:    PropTypes.object.isRequired,
  isCollapsed: PropTypes.bool,
  onFavorite:  PropTypes.func.isRequired
};

GuildList.defaultProps = {
  guilds:      [],
  favorites:   [],
  isCollapsed: false
};

export default GuildList;

import React from 'react';
import PropTypes from 'prop-types';
import GuildListItem from './GuildListItem';

const GuildList = ({ title, guilds, favorites, isCollapsed, onFavorite }) => {
  return (
    <div className="mb-4">
      <div className="sidebar-collapsed-hidden">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div
            className="text-small font-weight-bold text-muted text-uppercase"
            style={{ letterSpacing: '0.025rem' }}
          >
            {title}
          </div>
        </div>
      </div>
      <ul className="no-bullets guild-recommendations-list pl-0 sidebar-collapsed-hidden">
        {guilds.map((guild) => (
          <GuildListItem
            key={guild.name}
            guild={guild}
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
  guilds:      PropTypes.array,
  favorites:   PropTypes.array,
  isCollapsed: PropTypes.bool,
  onFavorite:  PropTypes.func.isRequired
};

GuildList.defaultProps = {
  guilds:      [],
  favorites:   [],
  isCollapsed: false
};

export default GuildList;

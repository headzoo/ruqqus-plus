import React from 'react';
import PropTypes from 'prop-types';

const GuildListItem = ({ guild, favorites, isCollapsed, onFavorite }) => {
  const isFavorited = favorites.indexOf(guild.name) !== -1;

  if (isCollapsed) {
    return (
      <li className="guild-recommendations-item">
        <a href={`/+${guild.name}`}>
          <img
            src={guild.avatar}
            className="profile-pic profile-pic-30 transition-square"
            alt=""
          />
        </a>
      </li>
    );
  }

  return (
    <li key={guild.name} className="guild-recommendations-item rp-better-sidebar-item">
      <a href={`/+${guild.name}`}>
        <div className="d-flex align-items-center">
          <div>
            <img
              src={guild.avatar}
              className="profile-pic profile-pic-30 mr-2"
              alt=""
            />
          </div>
          <div className="my-auto">
            <div className="text-black font-weight-normal">
              +{guild.name}
            </div>
          </div>
          <i
            role="button"
            tabIndex={0}
            aria-label={isFavorited ? 'Remove favorite' : 'Add favorite'}
            title={isFavorited ? 'Remove favorite' : 'Add favorite'}
            onClick={(e) => onFavorite(e, guild)}
            className={`fas fa-star rp-better-sidebar-star ml-auto ${isFavorited && 'rp-better-sidebar-favorited'}`}
          />
        </div>
      </a>
    </li>
  );
};

GuildListItem.propTypes = {
  guild:       PropTypes.object.isRequired,
  favorites:   PropTypes.array.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  onFavorite:  PropTypes.func.isRequired
};

export default GuildListItem;

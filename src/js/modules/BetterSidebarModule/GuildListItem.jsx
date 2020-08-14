import React from 'react';
import PropTypes from 'prop-types';

const GuildListItem = ({ guild, favorites, settings, isCollapsed, onFavorite }) => {
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
      <div className="d-flex align-items-center">
        <a href={`/+${guild.name}`} className="position-relative">
          {(settings.showBadgeNSFW && guild.isNSFW) && (
            <span className="badge text-danger border-danger border-1 text-small-extra rp-better-sidebar-item-nsfw">
              nsfw
            </span>
          )}
          <img
            src={guild.avatar}
            className="profile-pic profile-pic-30 mr-2"
            alt=""
          />
        </a>
        <div className="my-auto rp-better-sidebar-guild-name">
          <a href={`/+${guild.name}`} className="text-black font-weight-normal" title={`+${guild.name}`}>
            +{guild.name}
          </a>
        </div>
        <div className="ml-auto">
          <a href={`/submit?guild=${guild.name}`} title="Create Post">
            <i className="fas fa-pen rp-better-sidebar-icon mr-2" />
          </a>
          <i
            role="button"
            tabIndex={0}
            onClick={(e) => onFavorite(e, guild)}
            aria-label={isFavorited ? 'Remove favorite' : 'Add favorite'}
            title={isFavorited ? 'Remove favorite' : 'Add favorite'}
            className={`fas fa-star rp-better-sidebar-icon ${isFavorited && 'rp-better-sidebar-favorited'}`}
          />
        </div>
      </div>
    </li>
  );
};

GuildListItem.propTypes = {
  guild:       PropTypes.object.isRequired,
  favorites:   PropTypes.array.isRequired,
  settings:    PropTypes.object.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  onFavorite:  PropTypes.func.isRequired
};

export default GuildListItem;

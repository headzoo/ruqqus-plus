import React from 'react';
import PropTypes from 'prop-types';

const SidebarTools = ({ isCollapsed, onClick }) => {
  return (
    <div>
      {!isCollapsed && (
        <i
          tabIndex={0}
          role="button"
          title="Sidebar settings"
          aria-label="Sidebar settings"
          onClick={(e) => onClick(e, 'settings')}
          className="fas fa-cog rp-better-sidebar-collapse rp-better-sidebar-icon mr-2"
        />
      )}
      {isCollapsed ? (
        <i
          tabIndex={0}
          role="button"
          title="Expand"
          aria-label="Expand sidebar"
          onClick={(e) => onClick(e, 'collapse')}
          className="fas fa-chevron-circle-right rp-better-sidebar-collapse rp-better-sidebar-icon"
        />
      ) : (
        <i
          tabIndex={0}
          role="button"
          title="Collapse"
          aria-label="Collapse sidebar"
          onClick={(e) => onClick(e, 'collapse')}
          className="fas fa-chevron-circle-left rp-better-sidebar-collapse rp-better-sidebar-icon"
        />
      )}
    </div>
  );
};

SidebarTools.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onClick:     PropTypes.func.isRequired
};

export default SidebarTools;

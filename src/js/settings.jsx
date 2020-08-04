import React from 'react';
import ReactDOM from 'react-dom';
import actions from './actions';
import mods from './modules';

class App extends React.Component {
  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.state = {
      activePage:     '',
      pageComponents: {},
      sidebarItems:   {}
    };
  }

  /**
   *
   */
  componentDidMount() {
    let activePage       = '';
    const sidebarItems   = {};
    const pageComponents = {};

    Object.keys(actions).forEach((key, i) => {
      const actionObj = new actions[key]();
      const label     = actionObj.getSettingsSidebarLabel();
      if (!label) {
        return;
      }

      if (i === 0) {
        activePage = key;
      }
      sidebarItems[key] = label;
      pageComponents[key] = actionObj.getSettingsComponent();
    });

    chrome.storage.onChanged.addListener(this.handleStorageChange);
    chrome.storage.sync.get('modules', (value) => {
      const { modules } = value;

      Object.keys(modules).forEach((key) => {
        if (modules[key] && mods[key]) {
          const moduleObj = new mods[key]();
          const label     = moduleObj.getSettingsSidebarLabel();
          if (!label) {
            return;
          }

          sidebarItems[key] = label;
          pageComponents[key] = moduleObj.getSettingsComponent();
        }
      });

      this.setState({ activePage, sidebarItems, pageComponents });
    });
  }

  /**
   * @param {*} changes
   */
  handleStorageChange = (changes) => {
    if (changes.modules) {
      const { sidebarItems, pageComponents } = this.state;

      const modules           = changes.modules.newValue;
      const newSidebarItems   = Object.assign({}, sidebarItems);   // eslint-disable-line
      const newPageComponents = Object.assign({}, pageComponents); // eslint-disable-line

      Object.keys(modules).forEach((key) => {
        if (!modules[key] && newPageComponents[key]) {
          delete newPageComponents[key];
          delete newSidebarItems[key];
        } else if (modules[key] && !newPageComponents[key]) {
          const moduleObj = new mods[key]();
          const label     = moduleObj.getSettingsSidebarLabel();
          if (!label) {
            return;
          }

          newSidebarItems[key]   = label;
          newPageComponents[key] = moduleObj.getSettingsComponent();
        }
      });

      this.setState({
        sidebarItems:   newSidebarItems,
        pageComponents: newPageComponents
      });
    }
  };

  /**
   * @param {Event} e
   * @param {string} key
   */
  handleSidebarClick = (e, key) => {
    this.setState({ activePage: key });
  };

  /**
   * @returns {*}
   */
  render() {
    const { activePage, pageComponents, sidebarItems } = this.state;

    return (
      <>
        <header className="p-1">
          <div className="container">
            <img src="../images/icon-48.png" alt="Logo" />
          </div>
        </header>
        <div className="d-flex h-100">
          <nav className="sidebar">
            <ul id="sidebar-group" className="list-group">
              {Object.keys(sidebarItems).map((key) => (
                <li
                  key={key}
                  className={`list-group-item ${activePage === key ? 'active' : ''}`}
                  onClick={(e) => this.handleSidebarClick(e, key)}
                >
                  {sidebarItems[key]}
                </li>
              ))}
            </ul>
          </nav>
          <div className="pl-4 pr-4 flex-grow-1">
            <div className="page">
              {pageComponents[activePage] && React.createElement(pageComponents[activePage])}
            </div>
          </div>
        </div>
      </>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('mount')
);

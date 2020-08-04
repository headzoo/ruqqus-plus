import React from 'react';
import ReactDOM from 'react-dom';
import actions from './actions';

class App extends React.Component {
  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.state = {
      activePage:     '',
      pageComponents: {},
      sidebarItems:   []
    };
  }

  /**
   *
   */
  componentDidMount() {
    let activePage       = '';
    const sidebarItems   = [];
    const pageComponents = {};
    Object.keys(actions).forEach((key, i) => {
      const actionObj = new actions[key]();

      const label = actionObj.getLabel();
      if (!label) {
        return;
      }

      if (i === 0) {
        activePage = key;
      }
      sidebarItems.push({ key, label });
      pageComponents[key] = actionObj.getSettingsComponent();
    });

    this.setState({ activePage, sidebarItems, pageComponents });
  }

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
              {sidebarItems.map((item) => (
                <li
                  key={item.key}
                  className={`list-group-item ${activePage === item.key ? 'active': ''}`}
                  onClick={(e) => this.handleSidebarClick(e, item.key)}
                >
                  {item.label}
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

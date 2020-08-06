import React from 'react';
import toastr from 'toastr';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

const ThemeCard = styled.div`
  background-color: #1d1d1d;
`;

const ThemeTitle = styled.h2`
  font-size: 1rem;
  margin: 0;
`;

const ThemeImage = styled.img`
  height: 200px;
  object-fit: cover;
`;

export default class ThemeModuleSettings extends React.PureComponent {
  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.state = {
      activePage:   'installed',
      installed:    [],
      createValues: {
        id:          '',
        name:        '',
        author:      '',
        website:     '',
        version:     '1.0.0',
        description: '',
        css:         '',
        screenshot:  null,
        active:      false
      }
    };

    this.uploadRef = React.createRef();
  }

  /**
   *
   */
  componentDidMount() {
    this.setInstalledState();
  }

  /**
   * @param {string} activePage
   */
  setActivePage = (activePage) => {
    this.setState({
      activePage,
      createValues: {
        id:          '',
        name:        '',
        author:      '',
        website:     '',
        version:     '1.0.0',
        description: '',
        css:         '',
        screenshot:  null,
        active:      false
      }
    });
  };

  /**
   *
   */
  setInstalledState = () => {
    this.getDatabase()
      .then((db) => {
        const tx    = db.transaction(['themes'], 'readwrite');
        const store = tx.objectStore('themes');

        const request = store.getAll();
        request.onsuccess = (e) => {
          this.setState({ installed: e.target.result });
        };
        request.onerror = (e) => {
          this.toastError(`Error opening themes. ${e.target.errorCode}`);
        };
      });
  };

  /**
   * @param {string} message
   */
  toastSuccess = (message) => {
    toastr.success(message, '', {
      closeButton:   true,
      positionClass: 'toast-bottom-center'
    });
  };

  /**
   * @param {string} message
   */
  toastError = (message) => {
    toastr.error(message, '', {
      closeButton:   true,
      positionClass: 'toast-bottom-center'
    });
  };

  /**
   * @returns {Promise<IDBDatabase>}
   */
  getDatabase = () => {
    return new Promise((resolve) => {
      const dbReq = indexedDB.open('ThemeModule', 4);
      dbReq.onupgradeneeded = (e) => {
        e.target.result.createObjectStore('themes', { keyPath: 'id' });
      };
      dbReq.onsuccess = (e) => {
        resolve(e.target.result);
      };
      dbReq.onerror = (e) => {
        this.toastError(`Error initializing theme module. ${e.target.errorCode}`);
      };
    });
  };

  /**
   * @param {string} str
   * @returns {string}
   */
  createSlug = (str) => {
    return str
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  /**
   * @param {*} theme
   * @returns {boolean|string}
   */
  validateTheme = (theme) => {
    if (!theme.name || theme.name.trim() === '') {
      return 'Theme must have a name.';
    }
    if (!theme.version || theme.version.trim() === '') {
      return 'Theme must have a version';
    }
    const match = theme.version.match(/^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/);
    if (!match) {
      return 'Version must match x.x.x for example 1.33.5';
    }
    if (!theme.author || theme.author.trim() === '') {
      return 'Theme must have an author';
    }
    if (theme.website) {
      try {
        new URL(theme.website); // eslint-disable-line
      } catch (error) {
        return 'Invalid website URL.';
      }
    }

    return false;
  };

  /**
   *
   */
  handleUploadClick = () => {
    this.setState({ activePage: 'installed' });
    this.uploadRef.current.click();
  };

  /**
   * @param {*} e
   */
  handleUploadChange = (e) => {
    const { installed } = this.state;

    e.target.files.forEach((file) => {
      const reader = new FileReader();
      reader.addEventListener('load', (ev) => {
        const theme = JSON.parse(ev.target.result);
        if (!theme) {
          this.toastError('Invalid theme file.');
          return;
        }
        if (theme.__ruqqus_plus_theme !== true) {
          this.toastError('Invalid theme file.');
          return;
        }
        const error = this.validateTheme(theme);
        if (error) {
          this.toastError(error);
          return;
        }

        delete theme.active;
        delete theme.__ruqqus_plus_theme;
        theme.is_uploaded = true;

        let found = false;
        for (let i = 0; i < installed.length; i++) {
          if (installed[i].id === theme.id) {
            found = true;
            break;
          }
        }

        this.getDatabase()
          .then((db) => {
            const tx     = db.transaction(['themes'], 'readwrite');
            const store  = tx.objectStore('themes');

            let req;
            if (found) {
              req = store.put(theme);
            } else {
              req = store.add(theme);
            }

            req.onsuccess = () => {
              this.setState({ activePage: 'installed' });
              this.toastSuccess(found ? 'Theme updated!' : 'Theme added!');
              this.setInstalledState();
            };
            req.onerror = () => {
              this.toastError('Error adding the theme.');
            };
          });
      });
      reader.readAsText(file);
    });
  };

  /**
   * @returns {*}
   */
  renderCreate = () => {
    const { createValues } = this.state;

    /**
     * @param {*} e
     */
    const handleChange = (e) => {
      const newValues = { ...createValues };
      const { name } = e.target;
      if (name === 'screenshot') {
        const reader = new FileReader();
        reader.addEventListener('load', (ev) => {
          newValues.screenshot = ev.target.result;
          this.setState({ createValues: newValues });
        });
        reader.readAsBinaryString(e.target.files[0]);
      } else {
        newValues[name] = e.target.value;
        this.setState({ createValues: newValues });
      }
    };

    /**
     *
     */
    const handleSaveClick = () => {
      const error = this.validateTheme(createValues);
      if (error) {
        this.toastError(error);
        return;
      }

      this.getDatabase()
        .then((db) => {
          const record = { ...createValues };
          const tx     = db.transaction(['themes'], 'readwrite');
          const store  = tx.objectStore('themes');

          let req;
          if (record.id) {
            req = store.put(record);
          } else {
            record.id     = uuidv4();
            record.active = false;
            req = store.add(record);
          }

          req.onsuccess = () => {
            this.toastSuccess('Theme saved!');
            this.setState({ activePage: 'installed' });
            this.setInstalledState();
          };
          req.onerror = (ev) => {
            this.toastError(`Error saving theme. ${ev.target.errorCode}`);
          };
        });
    };

    /**
     * @param {*} e
     */
    const handleKeyDown = (e) => {
      if (e.keyCode === 9 || e.which === 9) {
        e.preventDefault();
        const { target } = e;
        const s = target.selectionStart;
        target.value = `${target.value.substring(0, target.selectionStart)}\t${target.value.substring(target.selectionEnd)}`;
        target.selectionEnd = s + 1;
      }
    };

    return (
      <div>
        <div className="form-group">
          <label htmlFor="theme-css">
            CSS
          </label>
          <textarea
            name="css"
            className="form-control"
            id="theme-css"
            rows="12"
            aria-describedby="theme-css-help"
            value={createValues.css}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <small id="theme-css-help" className="form-text text-muted">
            CSS added to every Ruqqus page.
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="theme-name">
            Name *
          </label>
          <input
            name="name"
            id="theme-name"
            maxLength={50}
            className="form-control"
            aria-describedby="theme-name-help"
            value={createValues.name}
            onChange={handleChange}
          />
          <small id="theme-name-help" className="form-text text-muted">
            Name of the theme.
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="theme-version">
            Version *
          </label>
          <input
            name="version"
            id="theme-version"
            maxLength={10}
            className="form-control"
            aria-describedby="theme-version-help"
            value={createValues.version}
            onChange={handleChange}
          />
          <small id="theme-version-help" className="form-text text-muted">
            Version number.
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="theme-author">
            Author *
          </label>
          <input
            name="author"
            id="theme-author"
            maxLength={25}
            className="form-control"
            aria-describedby="theme-author-help"
            value={createValues.author}
            onChange={handleChange}
          />
          <small id="theme-author-help" className="form-text text-muted">
            Name of the person that created the theme.
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="theme-website">
            Author Website
          </label>
          <input
            name="website"
            id="theme-website"
            className="form-control"
            maxLength={100}
            aria-describedby="theme-website-help"
            value={createValues.website}
            onChange={handleChange}
          />
          <small id="theme-author-help" className="form-text text-muted">
            Theme website.
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="theme-description">
            Description
          </label>
          <textarea
            name="description"
            className="form-control"
            id="theme-description"
            rows="3"
            maxLength={500}
            aria-describedby="theme-description-help"
            value={createValues.description}
            onChange={handleChange}
          />
          <small id="theme-description-help" className="form-text text-muted">
            A short description.
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="theme-screenshot">
            Screenshot
          </label>
          <input
            name="screenshot"
            id="theme-screenshot"
            className="form-control"
            aria-describedby="theme-screenshot-help"
            type="file"
            onChange={handleChange}
          />
          <small id="theme-screenshot-help" className="form-text text-muted">
            Screenshot
          </small>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleSaveClick}>
          Save
        </button>
      </div>
    );
  };

  /**
   * @returns {*}
   */
  renderInstalled = () => {
    const { installed } = this.state;

    /**
     * @param {*} theme
     */
    const handleActivateClick = (theme) => {
      this.getDatabase()
        .then((db) => {
          if (theme.active) {
            theme.active = false;
            const tx     = db.transaction(['themes'], 'readwrite');
            const store  = tx.objectStore('themes');
            const req    = store.put(theme);

            req.onsuccess = () => {
              this.toastSuccess('Theme deactivated!');
              this.setInstalledState();
            };
            req.onerror = (ev) => {
              this.toastError(`Failed to update theme. ${ev.target.errorCode}`);
            };

            return;
          }

          let updateCount      = 0;
          const installedCount = installed.length;

          const onSuccess = () => {
            updateCount += 1;
            if (updateCount === installedCount) {
              this.toastSuccess('Theme activated!');
              this.setInstalledState();
            }
          };

          const newInstalled = Array.from(installed);
          newInstalled.forEach((t) => {
            t.active     = t.id === theme.id;
            const tx     = db.transaction(['themes'], 'readwrite');
            const store  = tx.objectStore('themes');
            const req    = store.put(t);

            req.onsuccess = onSuccess;
            req.onerror = (ev) => {
              this.toastError(`Failed to update theme. ${ev.target.errorCode}`);
            };
          });
        });
    };

    /**
     * @param {*} theme
     */
    const handleEditClick = (theme) => {
      this.setState({ createValues: theme, activePage: 'create' });
    };

    /**
     * @param {*} theme
     */
    const handleDownloadClick = (theme) => {
      const newTheme = { ...theme };
      delete newTheme.active;
      delete newTheme.is_uploaded;
      newTheme.__ruqqus_plus_theme = true;

      const name   = `${this.createSlug(theme.name)}.json`;
      const data   = JSON.stringify(newTheme);
      const url    = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.setAttribute('href', url);
      anchor.setAttribute('download', name);
      anchor.setAttribute('style', 'display: none;');
      document.querySelector('body').appendChild(anchor);
      anchor.click();
      URL.revokeObjectURL(url);
      anchor.remove();
    };

    /**
     * @param {*} theme
     */
    const handleDeleteClick = (theme) => {
      // eslint-disable-next-line no-restricted-globals,no-alert
      if (!confirm('Are you sure you wanted to delete this theme?')) {
        return;
      }

      this.getDatabase()
        .then((db) => {
          const tx      = db.transaction(['themes'], 'readwrite');
          const store   = tx.objectStore('themes');
          const request = store.delete(theme.id);
          request.onsuccess = () => {
            this.toastSuccess('Theme deleted!');
            this.setInstalledState();
          };
          request.onerror = (ev) => {
            this.toastError(`Error deleting theme. ${ev.target.errorCode}`);
          };
        });
    };

    return (
      <div className="row">
        {installed.map((theme) => {
          const url = theme.screenshot
            ? `data:image/jpeg;base64,${btoa(theme.screenshot)}`
            : chrome.extension.getURL('images/no-theme.png');

          return (
            <div key={theme.id} className="col-3">
              <ThemeCard className={`card ${theme.active ? 'settings-theme-active' : ''}`}>
                <ThemeImage
                  src={url}
                  alt="Screenshot"
                  className="card-img-top"
                />
                <div className="card-body">
                  <ThemeTitle className="card-title">
                    {theme.name}
                  </ThemeTitle>
                  <small className="text-muted">
                    v{theme.version} by&nbsp;
                    {theme.website ? (
                      <a href={theme.website} target="_blank">
                        {theme.author}
                      </a>
                    ) : (
                      <span>{theme.author}</span>
                    )}
                  </small>
                  <div className="pt-2 w-100 d-flex">
                    <button
                      type="button"
                      className="btn btn-sm btn-primary mr-1 flex-grow-1"
                      onClick={() => handleActivateClick(theme)}
                    >
                      {theme.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-dark mr-1 flex-grow-1"
                      onClick={() => handleEditClick(theme)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-dark mr-1 flex-grow-1"
                      onClick={() => handleDownloadClick(theme)}
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-dark flex-grow-1"
                      onClick={() => handleDeleteClick(theme)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </ThemeCard>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * @returns {*}
   */
  render() {
    const { activePage } = this.state;

    let page;
    switch (activePage) {
      case 'installed':
        page = this.renderInstalled();
        break;
      case 'create':
        page = this.renderCreate();
        break;
    }

    return (
      <div>
        <input
          ref={this.uploadRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={this.handleUploadChange}
        />
        <div className="btn-group">
          <button
            type="button"
            onClick={() => this.setActivePage('installed')}
            className={`btn btn-primary ${activePage === 'installed' ? 'active' : ''}`}
          >
            Installed
          </button>
          <button
            type="button"
            onClick={this.handleUploadClick}
            className="btn btn-primary"
          >
            Upload Theme
          </button>
          <button
            type="button"
            onClick={() => this.setActivePage('create')}
            className={`btn btn-primary ${activePage === 'create' ? 'active' : ''}`}
          >
            Create Theme
          </button>
        </div>
        <div className="pt-4">
          {page}
        </div>
      </div>
    );
  }
}

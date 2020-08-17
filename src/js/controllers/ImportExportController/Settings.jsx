import React from 'react';
import controllers from '../index';
import modules from '../../modules';
import { promptToDownloadFile } from '../../utils/web';
import { toastSuccess, toastError } from '../../utils/toast';

export default class Settings extends React.PureComponent {
  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.fileInput = React.createRef();
  }

  /**
   * @returns {Promise<void>}
   */
  handleExport = async () => {
    const exportData = {};
    const cKeys = Object.keys(controllers);
    const mKeys = Object.keys(modules);

    for (let i = 0; i < cKeys.length; i++) {
      const key = cKeys[i];
      const obj = new controllers[key]();
      // eslint-disable-next-line no-await-in-loop
      const data = await obj.exportData();
      if (data) {
        exportData[key] = data;
      }
    }

    for (let i = 0; i < mKeys.length; i++) {
      const key = mKeys[i];
      const obj = new modules[key]();
      // eslint-disable-next-line no-await-in-loop
      const data = await obj.exportData();
      if (data) {
        exportData[key] = data;
      }
    }

    exportData.__ruqqus_plus_export = true;
    const data = JSON.stringify(exportData, null, 2);
    promptToDownloadFile('ruqqus-plus.json', data, 'application/json');
  };

  /**
   *
   */
  handleImport = () => {
    this.fileInput.current.click();
  };

  /**
   * @param {Event} e
   */
  handleImportChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', async (ev) => {
        const data = JSON.parse(ev.target.result);
        if (data.__ruqqus_plus_export) {
          delete data.__ruqqus_plus_export;
          const cKeys = Object.keys(controllers);
          const mKeys = Object.keys(modules);

          for (let i = 0; i < cKeys.length; i++) {
            const key = cKeys[i];
            if (data[key]) {
              const obj = new controllers[key]();
              // eslint-disable-next-line no-await-in-loop
              await obj.importData(data[key]);
            }
          }

          for (let i = 0; i < mKeys.length; i++) {
            const key = mKeys[i];
            if (data[key]) {
              const obj = new modules[key]();
              // eslint-disable-next-line no-await-in-loop
              await obj.importData(data[key]);
            }
          }

          toastSuccess('+RuqqusPlus settings imported!');
        } else {
          toastError('Invalid import file.');
        }
      });
      reader.readAsText(file);
    }
  };

  /**
   * @returns {*}
   */
  render() {
    return (
      <div>
        <p>
          All +RuqqusPlus data is saved in your browser. You will lose that data if you choose to uninstall the
          extension. Use the buttons below to save your data and restore it at a later time.
        </p>
        <input
          ref={this.fileInput}
          type="file"
          accept="application/json"
          onChange={this.handleImportChange}
          style={{ display: 'none' }}
        />
        <button type="button" className="btn btn-primary mr-2" onClick={this.handleExport}>
          Export
        </button>
        <button type="button" className="btn btn-primary" onClick={this.handleImport}>
          Import
        </button>
      </div>
    );
  }
}

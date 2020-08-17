import Controller from './Controller';
import Settings from './ImportExportController/Settings';

/**
 * Handles importing and exporting of extension data
 */
export default class ImportExportController extends Controller {
  /**
   * @returns {string}
   */
  getSettingsSidebarLabel = () => {
    return 'Import/Export';
  };

  /**
   * @returns {*}
   */
  getSettingsComponent = () => {
    return Settings;
  };
}

import modules from './modules';
import actions from './actions';

/**
 * This page is injected into ruqqus. Unlike contentScript.js, this script
 * has access to the window object, which contains ruqqus functions and variables.
 */

document.addEventListener('rp.modulesReady', (e) => {
  const { activeModules } = e.detail;

  const loadedModules = {};
  activeModules.forEach((key) => {
    const module = new modules[key]();
    module.execWindowContext();
    loadedModules[key] = module;
  });

  const loadedActions = {};
  Object.keys(actions).forEach((key) => {
    const action = new actions[key]();
    action.execWindowContext();
    loadedActions[key] = action;
  });
});

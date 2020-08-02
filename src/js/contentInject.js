import modules from './modules';

/**
 * This page is injected into ruqqus. Unlike contentScript.js, this script
 * has access to the window object, which contains ruqqus functions and variables.
 */

document.addEventListener('rp.modulesReady', (e) => {
  const { activeMods } = e.detail;

  const loaded = {};
  activeMods.forEach((key) => {
    const mod = new modules[key]();
    mod.execWindowContext();
    loaded[key] = mod;
  });
});

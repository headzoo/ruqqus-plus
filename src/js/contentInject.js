import modules from './modules';

/**
 * This page is injected into ruqqus. Unlike contentScript.js, this script
 * has access to the window object, which contains ruqqus functions and variables.
 */

document.addEventListener('rp.modulesReady', (e) => {
  const { activeMods } = e.detail;

  activeMods.forEach((key) => {
    modules[key].execInject();
  });
});

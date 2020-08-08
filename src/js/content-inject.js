import controllers from './controllers';

/**
 * This page gets injected into ruqqus. Unlike contentScript.js, this script
 * has access to the window object, which contains ruqqus functions and variables
 * which some actions/modules might need.
 */

const controllerObjects = {};
Object.keys(controllers).forEach((key) => {
  const c = new controllers[key]();
  c.execWindowContext();
  controllerObjects[key] = c;
});

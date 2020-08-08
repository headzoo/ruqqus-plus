import controllers from './controllers';

chrome.runtime.onInstalled.addListener(() => {
  Object.keys(controllers).forEach((key) => {
    const c = new controllers[key]();
    c.onInstalled();
  });
});

const controllerObjs = {};
Object.keys(controllers).forEach((key) => {
  const c = new controllers[key]();
  c.execBackgroundContext();
  controllerObjs[key] = c;
});

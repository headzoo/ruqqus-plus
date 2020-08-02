import modules from './modules';

document.addEventListener('rp.activeMods', (e) => {
    const { activeMods } = e.detail;

    activeMods.forEach((key) => {
        modules[key].execInject();
    });
});

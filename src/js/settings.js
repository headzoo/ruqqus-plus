import { createTemplateContent } from './utils/web';
import actions from './actions';

window.addEventListener('DOMContentLoaded', () => {
  const pagesMount  = document.getElementById('pages-mount');
  const sidebarList = document.getElementById('sidebar-group');

  // Add pages for each action.
  const actionObjects = [];
  Object.keys(actions).forEach((key, i) => {
    const actionObj = new actions[key]();
    actionObjects.push(actionObj);

    const label = actionObj.getLabel();
    if (!label) {
      return;
    }

    const sidebarItem = createTemplateContent(`
        <a href="#${key}" class="list-group-item">
            ${label}
        </a>
    `);
    sidebarList.appendChild(sidebarItem);

    const content = createTemplateContent(`
      <div class="page" data-page="${key}" style="display: ${i === 0 ? 'block' : 'none'};">
        ${actionObj.getSettingsHtml()}
      </div>
    `);
    pagesMount.appendChild(content);
  });

  actionObjects.forEach((pageObj) => {
    pageObj.onSettingsPageReady();
  });

  // Switch pages when sidebar items are clicked.
  const pagesContainers = document.querySelectorAll('.page');
  const sidebarItems    = document.querySelectorAll('.sidebar .list-group-item');

  sidebarItems[0].classList.add('active');

  /**
   * @param {*} e
   */
  const handleSidebarClick = (e) => {
    sidebarItems.forEach((item) => {
      item.classList.remove('active');
    });
    const href = e.target.getAttribute('href').replace('#', '');
    e.target.classList.add('active');

    pagesContainers.forEach((page) => {
      page.style.display = page.getAttribute('data-page') === href ? 'block' : 'none';
    });
  };

  sidebarItems.forEach((item) => {
    item.addEventListener('click', handleSidebarClick, false);
  });
});

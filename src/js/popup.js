import forms from './utils/forms';

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');

  chrome.storage.sync.get('user', (value) => {
    if (!value || !value.user) {
      // form.style.display = 'block';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const auth = forms.serialize(form);
    chrome.storage.sync.set({ auth }, () => {
      const body = new URLSearchParams();
      Object.keys(auth).forEach((key) => {
        body.append(key, auth[key]);
      });

      fetch('https://ruqqus.com/login', {
        method: 'post',
        body
      })
        .then((resp) => {
          if (resp.status === 200) {
            console.log('success');
          } else {
            console.error('Bad auth');
          }
        });
    });
  });
});

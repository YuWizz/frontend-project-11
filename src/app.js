import initRSSForm from './rss.js';
import i18next from './locales/localization.js';

function app() {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.rss-form');
    const input = form.querySelector('.rss-input');
    const submitButton = form.querySelector('button[aria-label="add"]');

    input.placeholder = i18next.t('form.placeholder');
    submitButton.textContent = i18next.t('form.submit');

    initRSSForm({
      form,
      input,
      onAddFeed: (url) => {
        console.log('Добавить:', url);
      },
    });
  });
}

export default app;

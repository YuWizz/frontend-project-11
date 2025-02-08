import onChange from 'on-change';
import i18next from './locales/localization.js';

export default function initView(state) {
  return onChange(state, (path, value) => {
    if (path === 'form.error') {
      const input = document.querySelector('.rss-input');
      const errorMessage = document.querySelector('.error-message');

      if (value) {
        input.classList.add('input-error');
        errorMessage.textContent = i18next.t(value);
      } else {
        input.classList.remove('input-error');
        errorMessage.textContent = '';
      }
    }

    if (path === 'form.url') {
      document.querySelector('.rss-input').value = value;
    }
  });
}

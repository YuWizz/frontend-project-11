import './styles.scss';
import  'bootstrap';
import { createValidationSchema } from './validation.js';
import { initView } from './view.js';
import i18next from './i18n.js';

export default async () => {
  await i18next.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru: {
        translation: {
          form: {
            feedback: {
              success: 'RSS успешно добавлен',
              duplicate: 'Этот RSS уже существует',
              invalid: 'URL недействителен',
            },
          },
        },
      },
    },
  });

  const state = {
    form: {
      status: null,
      error: null,
    },
    feeds: [],
  };

  const elements = {
    form: document.querySelector('#rss-form'),
    input: document.querySelector('#rss-input'),
    feedback: document.querySelector('#feedback'),
  };

  const watchedState = initView(state, elements, i18next);

  const validate = async (url) => {
    const schema = createValidationSchema(state.feeds);
    await schema.validate(url);
  };

  elements.form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const url = formData.get('url').trim();

    watchedState.form.status = 'filling';
    watchedState.form.error = null;

    try {
      await validate(url);
      state.feeds.push(url);
      watchedState.form.status = 'success';
    } catch (error) {
      watchedState.form.status = 'failed';
      watchedState.form.error = error.type;
    }
  });
};

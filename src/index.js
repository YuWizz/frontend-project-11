import './styles.scss';
import  'bootstrap';
import { createValidationSchema } from './validation.js';
import { initView } from './view.js';

export default () => {
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

  const watchedState = initView(state, elements);

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
      state.feeds.push(url); // Добавляем URL в список
      watchedState.form.status = 'success';
    } catch (error) {
      watchedState.form.status = 'failed';
      watchedState.form.error = error.message;
    }
  });
};

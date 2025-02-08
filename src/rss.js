import { createValidationSchema } from './validation.js';
import initView from './view.js';

export default function initRSSForm({ form, input, onAddFeed }) {
  const state = {
    form: {
      url: '',
      errorCode: null,
    },
    feeds: [],
  };

  const watchedState = initView(state);

  input.addEventListener('input', (event) => {
    watchedState.form.url = event.target.value;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const schema = createValidationSchema(state.feeds);

    try {
      await schema.validate({ url: state.form.url });

      state.feeds = [...state.feeds, state.form.url];
      onAddFeed(state.form.url);

      watchedState.form.url = '';
      watchedState.form.error = null;
    } catch (error) {
        watchedState.form.errorCode = error.message.key;
    }
  });
}

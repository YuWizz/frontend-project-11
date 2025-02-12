import { fetchRSSFeed } from './fetchFeed.js';
import { createValidationSchema } from './validation.js';
import initView from './view.js';

export default function initRSSForm({ form, input, onAddFeed }) {
  const state = {
    form: { url: '', error: null },
    feeds: [],
    posts: [],
  };

  const watchedState = initView(state);

  input.addEventListener('input', (event) => {
    watchedState.form.url = event.target.value;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const url = state.form.url.trim();

    const schema = createValidationSchema(state.feeds.map(feed => feed.url));

    try {
      await schema.validate({ url });

      const { feed, posts } = await fetchRSSFeed(url);

      state.feeds = [...state.feeds, { ...feed, url }];
      state.posts = [...state.posts, ...posts];

      onAddFeed(url);
      watchedState.form.url = '';
      watchedState.form.error = null;
    } catch (error) {
      watchedState.form.error = error.message?.key || 'errors.unknown';
    }
  });
}

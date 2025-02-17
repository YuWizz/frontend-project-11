import { fetchRSSFeed } from './fetchFeed.js';
import { createValidationSchema } from './validation.js';
import initView from './view.js';

export default function initRSSForm({ form, input, onAddFeed }) {
  const state = {
    form: { url: '', error: null },
    feeds: [],
    posts: [],
    viewedPosts: new Set(),
  };

  const watchedState = initView(state);

  input.addEventListener('input', (event) => {
    watchedState.form.url = event.target.value;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const url = state.form.url.trim();
    if (!url) return;

    const schema = createValidationSchema(state.feeds.map(feed => feed.url));

    try {
      await schema.validate({ url });

      const { feed, posts } = await fetchRSSFeed(url);

      state.feeds = [...state.feeds, { ...feed, url }];
      state.posts = [...state.posts, ...posts];

      onAddFeed(url);
      watchedState.form.url = '';
      input.value = '';
      watchedState.form.error = null;
    } catch (error) {
      watchedState.form.error = error.message || 'errors.unknown';
    }
  });

  const updateFeeds = async () => {
    if (state.feeds.length === 0) return;
    
    const allFeedRequests = state.feeds.map(async (feed) => {
      try {
        const { posts: newPosts } = await fetchRSSFeed(feed.url);
        const existingPostLinks = new Set(state.posts.map(post => post.link));

        const uniquePosts = newPosts.filter(post => !existingPostLinks.has(post.link));

        if (uniquePosts.length > 0) {
          state.posts = [...uniquePosts, ...state.posts];
        }
      } catch (error) {
        console.error(`Error update: ${feed.url}`, error);
      }
    });

    await Promise.all(allFeedRequests);

    setTimeout(updateFeeds, 5000);
  };

  updateFeeds();
}

import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import initView from './view.js';
import parseRSS from './parseRSS.js';
import resources from './locales/index.js';

const fetchRSSFeed = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  try {
    const proxyWithParams = new URL(proxyUrl);
    proxyWithParams.searchParams.set('url', url);

    return axios
      .get(proxyWithParams.toString())
      .then((response) => parseRSS(response.data.contents))
      .catch((error) => {
        console.error('Network error:', error);
        throw new Error('errors.network');
      });
  } catch (error) {
    throw new Error('errors.network');
  }
};

async function app() {
  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      required: 'errors.required',
      notOneOf: 'errors.duplicate',
    },
    string: {
      url: 'errors.invalidUrl',
    },
  });

  const form = document.querySelector('.rss-form');

  const state = {
    form: { error: null },
    feeds: [],
    posts: [],
    viewedPosts: new Set(),
  };

  const watchedState = initView(state, i18nextInstance);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get('url').trim();
    if (!url) return;

    const validationSchema = yup.object({
      url: yup
        .string()
        .url()
        .required()
        .notOneOf(state.feeds.map((feed) => feed.url)),
    });

    try {
      await validationSchema.validate({ url });

      const { feed, posts } = await fetchRSSFeed(url);

      state.feeds = [...state.feeds, { ...feed, url }];
      state.posts = [...state.posts, ...posts];

      watchedState.form.error = null;
    } catch (error) {
      watchedState.form.error = error.errors?.[0] || 'errors.unknown';
    }
  });

  const updateFeeds = async () => {
    if (state.feeds.length === 0) return;

    const allFeedRequests = state.feeds.map(async (feed) => {
      try {
        const { posts: newPosts } = await fetchRSSFeed(feed.url);
        const existingPostLinks = new Set(state.posts.map((post) => post.link));

        const uniquePosts = newPosts.filter((post) => !existingPostLinks.has(post.link));

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

export default app;

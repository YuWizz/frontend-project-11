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

const createValidationSchema = (existingUrls) =>
  yup.object({
    url: yup
      .string()
      .url('errors.invalidUrl')
      .required('errors.required')
      .notOneOf(existingUrls, 'errors.duplicate'),
  });

async function app() {
  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      required: () => i18nextInstance.t('errors.required'),
      notOneOf: () => i18nextInstance.t('errors.duplicate'),
    },
    string: {
      url: () => i18nextInstance.t('errors.invalidUrl'),
    },
  });

  const form = document.querySelector('.rss-form');
  const input = form.querySelector('.rss-input');
  const submitButton = form.querySelector('button[aria-label="add"]');

  input.placeholder = i18nextInstance.t('form.placeholder');
  submitButton.textContent = i18nextInstance.t('form.submit');

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

    try {
      await createValidationSchema(state.feeds.map((feed) => feed.url)).validate({ url });

      const { feed, posts } = await fetchRSSFeed(url);

      state.feeds = [...state.feeds, { ...feed, url }];
      state.posts = [...state.posts, ...posts];

      watchedState.form.url = '';
      input.value = '';
      watchedState.form.error = null;
    } catch (error) {
      watchedState.form.error = i18nextInstance.t(error.errors?.[0] || 'errors.unknown');
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

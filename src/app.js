import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import initView from './view.js';
import parseRSS from './parseRSS.js';
import resources from './locales/index.js';

const fetchRSSFeed = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  const proxyWithParams = new URL(proxyUrl);
  proxyWithParams.searchParams.set('url', url);
  proxyWithParams.searchParams.set('disableCache', 'true');

  console.log('Fetching RSS from:', proxyWithParams.toString());

  return axios
    .get(proxyWithParams.toString())
    .then((response) => {
      console.log('Fetched RSS response:', response.data);
      const { feed, posts } = parseRSS(response.data.contents);
      const feedId = uniqueId('feed_');

      return {
        feed: { ...feed, id: feedId, url },
        posts: posts.map((post) => ({ ...post, id: uniqueId('post_'), feedId })),
      };
    })
    .catch((error) => {
      console.error('Network error:', error);
      throw new Error('errors.networkError');
    });
};

function app() {
  const i18nextInstance = i18next.createInstance();

  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    yup.setLocale({
      mixed: {
        required: 'errors.empty',
        notOneOf: 'errors.alreadyInList',
      },
      string: {
        url: 'errors.notUrl',
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

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const url = formData.get('url').trim();

      const validationSchema = yup.object({
        url: yup
          .string()
          .url()
          .required()
          .notOneOf(state.feeds.map((feed) => feed.url)),
      });

      validationSchema.validate({ url })
        .then(() => fetchRSSFeed(url))
        .then(({ feed, posts }) => {
          console.log('Feed added:', feed);
          watchedState.feeds = [...state.feeds, feed];
          watchedState.posts = [...state.posts, ...posts];
          console.log('Updated state.feeds:', state.feeds);
          watchedState.form.error = null;
          console.log('Form error reset:', watchedState.form.error);

          const input = document.querySelector('#url-input');
          input.value = '';
          input.focus();
        })
        .catch((validationError) => {
          if (validationError.name === 'ValidationError') {
            const [errorMessage] = validationError.errors;
            watchedState.form.error = errorMessage;
          } else {
            console.error('RSS fetch error:', validationError);
            watchedState.form.error = 'errors.networkError';
          }
        });
    });

    const updateFeeds = () => {
      if (state.feeds.length === 0) return;

      const allFeedRequests = state.feeds.map((feed) => fetchRSSFeed(feed.url)
        .then(({ posts: newPosts }) => {
          const existingPostLinks = new Set(state.posts.map((post) => post.link));
          const uniquePosts = newPosts.filter((post) => !existingPostLinks.has(post.link));

          if (uniquePosts.length > 0) {
            watchedState.posts = [...uniquePosts, ...state.posts];
          }
        })
        .catch((error) => {
          console.error(`Error update: ${feed.url}`, error);
        }));

      Promise.all(allFeedRequests)
        .finally(() => setTimeout(updateFeeds, 5000));
    };

    updateFeeds();
  }).catch((error) => {
    console.error('i18next init error:', error);
  });
}

export default app;

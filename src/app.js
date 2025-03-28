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
      if (!response.data || !response.data.contents) {
        console.error('Invalid response structure from proxy:', response.data);
        throw new Error('errors.networkError');
      }
      console.log('Fetched RSS response contents:', response.data.contents);
      try {
        const { feed, posts } = parseRSS(response.data.contents);
        const feedId = uniqueId('feed_');

        return {
          feed: { ...feed, id: feedId, url },
          posts: posts.map((post) => ({ ...post, id: uniqueId('post_'), feedId })),
        };
      } catch (parseError) {
        console.error('Parsing error:', parseError);
        if (parseError.message === 'errors.notRss') {
          throw parseError;
        } else {
          throw new Error('errors.notRss');
        }
      }
    })
    .catch((error) => {
      console.error('Network or Parsing Error during fetch:', error);
      if (['errors.networkError', 'errors.notRss'].includes(error.message)) {
        throw error;
      }
      throw new Error('errors.networkError');
    });
};

const updateFeeds = (watchedState) => {
  if (watchedState.feeds.length === 0) {
    setTimeout(() => updateFeeds(watchedState), 5000);
    return;
  }

  const promises = watchedState.feeds.map((feed) => fetchRSSFeed(feed.url)
    .then(({ posts: newPosts }) => {
      const existingPostLinks = new Set(watchedState.posts.map((post) => post.link));
      const trulyNewPosts = newPosts
        .filter((post) => !existingPostLinks.has(post.link))
        .map((post) => ({ ...post, id: uniqueId('post_'), feedId: feed.id }));

      if (trulyNewPosts.length > 0) {
        watchedState.posts.unshift(...trulyNewPosts);
      }
    })
    .catch((error) => {
      console.error(`Error updating feed ${feed.url}:`, error);
    }));

  Promise.allSettled(promises)
    .finally(() => {
      setTimeout(() => updateFeeds(watchedState), 5000);
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

    const state = {
      form: { error: null },
      loadingProcess: { status: 'idle', error: null },
      feeds: [],
      posts: [],
      uiState: { viewedPosts: new Set() },
    };

    const elements = {
      form: document.querySelector('.rss-form'),
      input: document.querySelector('#url-input'),
      submitButton: document.querySelector('button[type="submit"]'),
      feedback: document.querySelector('.feedback'),
      feedsContainer: document.querySelector('.feeds'),
      postsContainer: document.querySelector('.posts'),
      modal: {
        title: document.querySelector('.modal-title'),
        body: document.querySelector('.modal-body'),
        fullArticleLink: document.querySelector('.full-article'),
      },
    };

    const watchedState = initView(state, i18nextInstance);

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const url = formData.get('url').trim();

      watchedState.form.error = null;
      watchedState.loadingProcess.error = null;
      watchedState.loadingProcess.status = 'sending';

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
          watchedState.feeds.push(feed);
          watchedState.posts.unshift(...posts);
          watchedState.loadingProcess.status = 'success';

          if (elements.input) {
            elements.input.value = '';
            elements.input.focus();
          }
        })
        .catch((error) => {
          watchedState.loadingProcess.status = 'failed';

          if (error instanceof yup.ValidationError) {
            const [validationErrorKey] = error.errors;
            watchedState.form.error = validationErrorKey;
            watchedState.loadingProcess.error = null;
          } else if (error.message && error.message.startsWith('errors.')) {
            watchedState.loadingProcess.error = error.message;
            watchedState.form.error = null;
          } else {
            console.error('Unknown error:', error);
            watchedState.loadingProcess.error = 'errors.unknown';
            watchedState.form.error = null;
          }
        });
    });

    if (elements.postsContainer) {
      elements.postsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-id]');
        if (!button) return;

        const postId = button.dataset.id;
        watchedState.uiState.viewedPosts.add(postId);

        const post = watchedState.posts.find((p) => p.id === postId);

        if (!post) {
          console.error(`Post with ID ${postId} not found in state.`);
          return;
        }

        if (elements.modal.title) elements.modal.title.textContent = post.title;
        if (elements.modal.body) elements.modal.body.textContent = post.description || '';
        if (elements.modal.fullArticleLink) elements.modal.fullArticleLink.href = post.link;
      });
    }

    setTimeout(() => updateFeeds(watchedState), 5000);
  }).catch((error) => {
    console.error('i18next initialization failed:', error);
  });
}

export default app;

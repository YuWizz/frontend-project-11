import onChange from 'on-change';
import i18next from './locales/localization.js';

const createFeedElement = (feed) => {
  const feedContainer = document.createElement('div');
  feedContainer.classList.add('feed');

  const title = document.createElement('h3');
  title.textContent = feed.title;

  const description = document.createElement('p');
  description.textContent = feed.description;

  feedContainer.append(title, description);
  return feedContainer;
};

const createPostList = (posts) => {
  const ul = document.createElement('ul');
  ul.classList.add('posts', 'list-group');

  posts.forEach(({ title, link }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');

    const a = document.createElement('a');
    a.href = link;
    a.textContent = title;
    a.target = '_blank';

    li.append(a);
    ul.append(li);
  });

  return ul;
};

export default function initView(state) {
  return onChange(state, (path, value) => {
    if (path === 'form.error') {
      const input = document.querySelector('.rss-input');
      const errorMessage = document.querySelector('.error-message');

      if (value) {
        input.classList.add('is-invalid');
        errorMessage.textContent = i18next.t(value);
        errorMessage.classList.add('invalid-feedback');
      } else {
        input.classList.remove('is-invalid');
        errorMessage.textContent = '';
        errorMessage.classList.remove('invalid-feedback');
      }
    }

    if (path === 'feeds') {
      const feedsContainer = document.querySelector('.feeds');
      feedsContainer.innerHTML = '';
      value.forEach((feed) => feedsContainer.append(createFeedElement(feed)));
    }

    if (path === 'posts') {
      const postsContainer = document.querySelector('.posts-container');
      postsContainer.innerHTML = '';
      postsContainer.append(createPostList(value));
    }
  });
}

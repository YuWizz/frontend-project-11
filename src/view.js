import onChange from 'on-change';

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

const createPostList = (posts, state) => {
  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  posts.forEach(({
    id, title, link, description,
  }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

    const a = document.createElement('a');
    a.href = link;
    a.textContent = title;
    a.target = '_blank';
    a.classList.add(state.viewedPosts.has(id) ? 'fw-normal' : 'fw-bold');

    const previewButton = document.createElement('button');
    previewButton.textContent = 'view';
    previewButton.classList.add('btn', 'btn-primary', 'btn-sm', 'ms-3');
    previewButton.dataset.id = id;
    previewButton.dataset.bsToggle = 'modal';
    previewButton.dataset.bsTarget = '#modal';

    previewButton.addEventListener('click', () => {
      state.viewedPosts.add(id);
      a.classList.remove('fw-bold');
      a.classList.add('fw-normal');

      const modalTitle = document.querySelector('.modal-title');
      const modalBody = document.querySelector('.modal-body');
      const fullArticleLink = document.querySelector('.full-article');

      if (!modalTitle || !modalBody || !fullArticleLink) {
        console.error('Error: modal window elements not found');
        return;
      }

      modalTitle.textContent = title;
      modalBody.textContent = description || 'No description';
      fullArticleLink.href = link;
    });

    li.append(a, previewButton);
    ul.append(li);
  });

  return ul;
};

export default function initView(state, i18nextInstance) {
  return onChange(state, (path, value) => {
    if (path === 'form.error') {
      const input = document.querySelector('#url-input');
      const errorMessage = document.querySelector('.feedback');

      if (!input || !errorMessage) {
        console.error('Error: element is not found');
        return;
      }

      if (value) {
        input.classList.add('is-invalid');
        errorMessage.textContent = i18nextInstance.t(value);
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
      const postsContainer = document.querySelector('.posts');
      postsContainer.innerHTML = '';
      postsContainer.append(createPostList(value));
    }
  });
}

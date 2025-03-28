import onChange from 'on-change';

const createFeedElement = (feed) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item');

  const title = document.createElement('h3');
  title.classList.add('h6', 'm-0');
  title.textContent = feed.title;

  const description = document.createElement('p');
  description.classList.add('m-0', 'small', 'text-black-50');
  description.textContent = feed.description;

  li.append(title, description);
  return li;
};

const createPostElement = (post, viewedPosts, i18nextInstance) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

  const a = document.createElement('a');
  a.href = post.link;
  a.textContent = post.title;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.classList.add(viewedPosts.has(post.id) ? 'fw-normal' : 'fw-bold');
  a.dataset.id = post.id;

  const previewButton = document.createElement('button');
  previewButton.type = 'button';
  previewButton.textContent = i18nextInstance.t('buttons.view');
  previewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  previewButton.dataset.id = post.id;
  previewButton.dataset.bsToggle = 'modal';
  previewButton.dataset.bsTarget = '#modal';

  li.append(a, previewButton);
  return li;
};

const renderFeeds = (feeds, i18nextInstance) => {
  if (feeds.length === 0) {
    return null;
  }

  const card = document.createElement('div');
  card.classList.add('card');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nextInstance.t('items.feeds');
  cardBody.append(cardTitle);

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  feeds.forEach((feed) => {
    ul.append(createFeedElement(feed));
  });

  card.append(cardBody, ul);
  return card;
};

const renderPosts = (posts, viewedPosts, i18nextInstance) => {
  if (posts.length === 0) {
    return null;
  }

  const card = document.createElement('div');
  card.classList.add('card');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nextInstance.t('items.posts');
  cardBody.append(cardTitle);

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  posts.forEach((post) => {
    ul.append(createPostElement(post, viewedPosts, i18nextInstance));
  });

  card.append(cardBody, ul);
  return card;
};

export default function initView(state, i18nextInstance) {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    submitButton: document.querySelector('.rss-form button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };

  if (
    !elements.input
    || !elements.feedback
    || !elements.submitButton
    || !elements.feedsContainer
    || !elements.postsContainer
  ) {
    console.error('Error: One or more essential UI elements not found in the DOM.');
    return state;
  }

  const watcher = (path, value) => {
    switch (path) {
      case 'form.error':
        if (value) {
          elements.input.classList.add('is-invalid');
          elements.feedback.textContent = i18nextInstance.t(value);
          elements.feedback.classList.remove('text-success', 'text-muted');
          elements.feedback.classList.add('text-danger');
        } else {
          elements.input.classList.remove('is-invalid');
          if (!state.loadingProcess.error && !['sending', 'success'].includes(state.loadingProcess.status)) {
            elements.feedback.textContent = '';
            elements.feedback.classList.remove('text-danger');
          }
        }
        break;

      case 'loadingProcess.status':
        switch (value) {
          case 'sending':
            elements.submitButton.disabled = true;
            elements.input.readOnly = true;
            elements.feedback.textContent = i18nextInstance.t('status.sending');
            elements.feedback.classList.remove('text-danger', 'text-success');
            elements.feedback.classList.add('text-muted');
            break;
          case 'failed':
            elements.submitButton.disabled = false;
            elements.input.readOnly = false;
            break;
          case 'success':
            elements.submitButton.disabled = false;
            elements.input.readOnly = false;
            elements.feedback.textContent = i18nextInstance.t('status.success');
            elements.feedback.classList.remove('text-danger', 'text-muted');
            elements.feedback.classList.add('text-success');
            break;
          default:
            elements.submitButton.disabled = false;
            elements.input.readOnly = false;
            if (!state.form.error) {
              elements.feedback.textContent = '';
              elements.feedback.classList.remove('text-danger', 'text-success', 'text-muted');
            }
            break;
        }
        break;

      case 'loadingProcess.error':
        if (value) {
          elements.feedback.textContent = i18nextInstance.t(value);
          elements.feedback.classList.remove('text-success', 'text-muted');
          elements.feedback.classList.add('text-danger');
        }
        break;

      case 'feeds': {
        elements.feedsContainer.innerHTML = '';
        const feedsCard = renderFeeds(value, i18nextInstance);
        if (feedsCard) {
          elements.feedsContainer.append(feedsCard);
        }
        break;
      }

      case 'posts':
      case 'uiState.viewedPosts': {
        elements.postsContainer.innerHTML = '';
        const postsCard = renderPosts(state.posts, state.uiState.viewedPosts, i18nextInstance);
        if (postsCard) {
          elements.postsContainer.append(postsCard);
        }
        break;
      }

      default:
        break;
    }
  };

  return onChange(state, watcher, { deep: true });
}

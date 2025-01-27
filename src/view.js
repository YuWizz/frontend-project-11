import onChange from 'on-change';

export default (state, elements) => {
  const { input, feedback, form } = elements;

  return onChange(state, (path, value) => {
    if (path === 'form.valid') {
      if (value) {
        input.classList.remove('is-invalid');
        feedback.textContent = '';
      } else {
        input.classList.add('is-invalid');
        feedback.textContent = state.form.errorMessage;
      }
    }

    if (path === 'feeds') {
      form.reset();
      input.focus();
    }
  });
};

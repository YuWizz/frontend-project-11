import onChange from 'on-change';

export const initView = (state, elements) => {
  const { form, input, feedback } = elements;

  return onChange(state, (path, value) => {
    if (path === 'form.error') {
      input.classList.toggle('is-invalid', !!value);
      feedback.textContent = value || '';
    }

    if (path === 'form.status' && value === 'success') {
      input.classList.remove('is-invalid');
      feedback.textContent = '';
      form.reset();
      input.focus();
    }
  });
};

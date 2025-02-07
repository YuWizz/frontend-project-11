import onChange from 'on-change';

export const initView = (state, elements, i18next) => {
  const { form, input, feedback } = elements;

  return onChange(state, (path, value) => {
    if (path === 'form.error') {
      if (value) {
        input.classList.add('is-invalid');
        feedback.textContent = i18next.t(`form.feedback.${value}`);
        feedback.classList.add('text-danger');
      } else {
        input.classList.remove('is-invalid');
        feedback.textContent = '';
        feedback.classList.remove('text-danger');
      }
    }

    if (path === 'form.status' && value === 'success') {
      input.classList.remove('is-invalid');
      feedback.textContent = i18next.t('form.feedback.success');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      form.reset();
      input.focus();
    }
  });
};

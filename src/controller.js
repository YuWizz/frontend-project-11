import { createValidationSchema } from './validation.js';

export default (state, view, elements) => {
  const { form, input } = elements;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const url = formData.get('url');

    const schema = createValidationSchema(state.feeds);

    try {
      await schema.validate({ url });
      state.form.valid = true;
      state.form.errorMessage = '';
      state.feeds.push(url);
    } catch (error) {
      state.form.valid = false;
      state.form.errorMessage = error.message;
    }
  });
};

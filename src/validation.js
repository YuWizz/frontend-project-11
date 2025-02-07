import * as yup from 'yup';

yup.setLocale({
  string: {
    url: () => 'invalid',
  },
  mixed: {
    required: () => 'invalid',
    notOneOf: () => 'duplicate',
  },
});

export const createValidationSchema = (existingFeeds) =>
  yup.string().required().url().notOneOf(existingFeeds);

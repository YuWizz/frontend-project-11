import * as yup from 'yup';

export const createValidationSchema = (existingFeeds) => {
  return yup.object({
    url: yup
      .string()
      .url()
      .required()
      .test('is-unique', { key: 'errors.duplicate' }, async (value) => !existingFeeds.includes(value)),
  });
};

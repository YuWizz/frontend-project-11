import * as yup from 'yup';

export const createValidationSchema = (existingUrls) => {
  return yup.object({
    url: yup
      .string()
      .url('errors.invalidUrl')
      .required('errors.required')
      .test(
        'is-unique',
        () => ({ key: 'errors.duplicate' }),
        async (value) => !existingUrls.includes(value)
      ),
  });
};

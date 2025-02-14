import * as yup from 'yup';

export const createValidationSchema = (fetchExistingUrls) => {
  return yup.object({
    url: yup
      .string()
      .url('errors.invalidUrl')
      .required('errors.required')
      .test(
        'is-unique',
        () => ({ key: 'errors.duplicate' }),
        (value) =>
          fetchExistingUrls().then((existingUrls) => !existingUrls.includes(value))
      ),
  });
};

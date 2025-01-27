import * as yup from 'yup';

export const createValidationSchema = (existingUrls) =>
  yup.object().shape({
    url: yup
      .string()
      .url('Uncorrect URL')
      .notOneOf(existingUrls, 'This RSS has already been added')
      .required('URL is required'),
  });

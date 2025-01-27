import * as yup from 'yup';

export const createValidationSchema = (existingFeeds) =>
  yup.string()
    .required('URL can not be empty')
    .url('Put a correct URL')
    .notOneOf(existingFeeds, 'This URL has already been added');

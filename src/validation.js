import * as yup from 'yup';

export const createValidationSchema = (existingFeeds) =>
  yup.string()
    .required('Заполните это поле')
    .url('Ссылка должна быть валидным URL')
    .notOneOf(existingFeeds, 'Этот URL уже добавлен');

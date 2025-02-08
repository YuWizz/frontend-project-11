import i18next from 'i18next';
import * as yup from 'yup';

i18next.init({
  lng: 'ru',
  resources: {
    ru: {
      translation: {
        errors: {
          invalidUrl: 'Ссылка должна быть валидным URL',
          required: 'Заполните это поле',
          duplicate: 'Такой RSS уже добавлен',
        },
        form: {
          placeholder: 'Введите URL RSS',
          submit: 'Добавить',
        },
      },
    },
  },
});

yup.setLocale({
  string: {
    url: () => ({ key: 'errors.invalidUrl' }),
  },
  mixed: {
    required: () => ({ key: 'errors.required' }),
  },
});

export default i18next;

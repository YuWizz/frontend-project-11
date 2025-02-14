import i18next from 'i18next';
import * as yup from 'yup';

i18next.init({
  lng: 'ru',
  resources: {
    ru: {
      translation: {
        errors: {
          notUrl: 'Ссылка должна быть валидным URL',
          alreadyInList: 'RSS уже существует',
          notRss: 'Ресурс не содержит валидный RSS',
          networkError: 'Ошибка сети',
          unknown: 'Что-то пошло не так',
          empty: 'Не должно быть пустым',
        },
        status: {
          sending: 'RSS загружается',
          success: 'RSS успешно загружен',
        },
        items: {
          feeds: 'Фиды',
          posts: 'Посты',
        },
        buttons: {
          view: 'Просмотр',
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

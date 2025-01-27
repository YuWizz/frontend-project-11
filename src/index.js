import './styles.scss';
import  'bootstrap';
import view from './view.js';
import controller from './controller.js';

const state = {
  feeds: [],
  form: {
    valid: true,
    errorMessage: '',
  },
};

const elements = {
  form: document.querySelector('form'),
  input: document.querySelector('input[name="url"]'),
  feedback: document.querySelector('.feedback'),
};

const watchedState = view(state, elements);
controller(watchedState, elements);

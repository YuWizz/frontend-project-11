import axios from 'axios';
import parseRSS from './parseRSS.js';

const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');

export const fetchRSSFeed = (url) => {
  try {
    const proxyWithParams = new URL(proxyUrl);
    proxyWithParams.searchParams.set('url', url);

    return axios
      .get(proxyWithParams.toString())
      .then((response) => parseRSS(response.data.contents))
      .catch(() => {
        throw new Error('errors.network');
      });
  } catch (error) {
    throw new Error('errors.network');
  }
};

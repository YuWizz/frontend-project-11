const parseRSS = (rssText) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(rssText, 'application/xml');

  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('errors.invalidRSS');
  }

  const title = xmlDoc.querySelector('channel > title')?.textContent.trim() || '';
  const description = xmlDoc.querySelector('channel > description')?.textContent.trim() || '';

  const posts = [...xmlDoc.querySelectorAll('item')].map((item) => ({
    title: item.querySelector('title')?.textContent.trim() || '',
    link: item.querySelector('link')?.textContent.trim() || '',
  }));

  return { feed: { title, description }, posts };
};

export default parseRSS;

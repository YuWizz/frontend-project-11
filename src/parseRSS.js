const generateId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const parseRSS = (rssText) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(rssText, 'application/xml');

  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('errors.invalidRSS');
  }

  const feedId = generateId();
  const title = xmlDoc.querySelector('channel > title')?.textContent.trim() || 'No name';
  const description = xmlDoc.querySelector('channel > description')?.textContent.trim() || 'No description';

  const posts = [...xmlDoc.querySelectorAll('item')].map((item) => ({
    id: generateId(),
    feedId,
    title: item.querySelector('title')?.textContent.trim() || 'No name',
    link: item.querySelector('link')?.textContent.trim() || '#',
  }));

  return { feed: { id: feedId, title, description }, posts };
};

export default parseRSS;

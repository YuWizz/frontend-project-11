const parseRSS = (rssText) => {
  const parser = new DOMParser();
  console.log('Raw RSS response:', rssText);
  const xmlDoc = parser.parseFromString(rssText, 'application/xml');

  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('errors.invalidRSS');
  }

  const title = xmlDoc.querySelector('channel > title')?.textContent.trim() || '';
  const description = xmlDoc.querySelector('channel > description')?.textContent.trim() || '';

  const posts = [...xmlDoc.querySelectorAll('item')].map((item) => ({
    title: item.querySelector('title')?.textContent.trim() || '',
    link: item.querySelector('link')?.textContent.trim() || '',
    description: item.querySelector('description')?.textContent.trim() || 'No description',
  }));

  return { feed: { title, description }, posts };
};

export default parseRSS;

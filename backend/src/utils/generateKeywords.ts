export default function generateKeywords(name: string): string[] {
  const wordArr = name.toLowerCase().split(' ');
  const searchableKeywords = [];
  let prevKey = '';
  // eslint-disable-next-line
  for (const word of wordArr) {
    const charArr = word.toLowerCase().split('');
    // eslint-disable-next-line
    for (const char of charArr) {
      const keyword = prevKey + char;
      searchableKeywords.push(keyword);
      prevKey = keyword;
    }
    prevKey = '';
  }
  return searchableKeywords;
}

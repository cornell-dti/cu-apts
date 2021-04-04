export const generateKeywords = (name: string) => {
  const wordArr = name.toLowerCase().split(' ');
  const searchableKeywords = [];
  let prevKey = '';
  for (const word of wordArr) {
    const charArr = word.toLowerCase().split('');
    for (const char of charArr) {
      const keyword = prevKey + char;
      searchableKeywords.push(keyword);
      prevKey = keyword;
    }
    prevKey = '';
  }
  return searchableKeywords;
};

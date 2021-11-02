const Filter = require('bad-words');

const filter = new Filter();

export const includesProfanity = (s: string) => filter.isProfane(s);

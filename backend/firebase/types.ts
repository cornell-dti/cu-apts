export type Faq = {
  question: string;
  answer: string;
};

export type Section = {
  headerName: string;
  faqs: [Faq];
};
